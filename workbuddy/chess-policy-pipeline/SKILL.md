---
name: chess-policy-pipeline
description: Use when building, training, or improving a chess move-policy neural network that guides alpha-beta search, especially the Rust `my-engine` (STAR / star-ai-board project). Covers UCI self-play data generation, 8x D4 data augmentation, Stockfish teacher labels, lightweight CNN training, zero-dependency Rust inference, golden verification, and match-based strength evaluation.
---

# Chess Policy Pipeline (self-play → CNN → zero-dep Rust inference)

## Overview
End-to-end recipe for a small policy network that biases move ordering in an alpha-beta
chess search. Validated on `my-engine` (Rust + `chess` crate). The hard part is NOT the
math — it is the silent layout/IO mismatches between Python (training) and Rust (inference).
This skill records every one of those traps.

## When to Use
- Training a `from*64+to` (4096-class) move-prior for a chess engine.
- Generating self-play / teacher datasets via UCI.
- Adding policy guidance to a Rust alpha-beta searcher.
- Measuring whether a policy change actually improves playing strength.
- NOT for: full evaluation networks (NNUE), MCTS value nets, or non-chess games.

## Pipeline
1. **Self-play data** — drive the engine over UCI (`dataset_gen.py`). Record per-ply
   `{fen, bestmove_uci, score_cp, ...}` as JSONL. Keep only decisive/active positions
   (drop games that hit the ply cap; truncate to first ~40 plies).
2. **Teacher labels — CAUTION** — `make_teacher.py` queries Stockfish
   (`public/stockfish`) per FEN at depth 8–10, replaces `bestmove_uci`. This is a
   FOREIGN-engine teacher. Because the policy only guides MOVE ORDERING (not the final move),
   a foreign engine's idea of "good move" does NOT transfer — it mismatches my-engine's own
   eval and gives no ordering benefit. Empirical result: 40-game match at 300ms showed
   BEFORE(self-play) 10 / AFTER(Stockfish-teacher) 9, Elo Δ +8.7, CI [-102, +121] → NO gain.
   **Use SELF-DISTILLATION instead**: label each FEN with my-engine's OWN bestmove at a
   deeper search (depth 8–10 of itself). That aligns the policy with the engine's own
   evaluation, so ordering guidance actually helps. This is the correct labeling strategy.
3. **Augment** — 8× D4 board symmetries (rot90/180/270 + flips). Transform board AND the
   move; DROP castling/ep on non-identity transforms and KEEP only variants where the
   transformed move is `board.is_legal` (python-chess). This removes illegal-label noise.
4. **Train** — tiny CNN `13ch→16→16 conv3x3(pad1)→FC1024→64→4096`. 80/20 split.
   `train_policy.py` (system python, see Gotchas).
5. **Export** — `export_weights.py` writes `policy.bin` (float32, exact order below).
6. **GOLDEN TEST (mandatory)** — `policy_golden_test.py`: numpy re-impl of `predict()`
   reads `policy.bin`, compares to `policy.onnx` via onnxruntime. Max |Δlogit| ~5e-5 and
   identical top-1 ⇒ Rust matches training. NEVER skip — proves the model actually runs.
7. **Evaluate** — `match.py` plays engine-vs-engine N games, swapped colors, fixed
   movetime. Reports W/D/L + Elo diff with 95% CI. Compare before/after policy.

## Critical Gotchas (silent bugs)
- **⚠️ Timeout sentinel poisoning the transposition table** — the single worst silent
  strength-killer. If `alpha_beta`/`quiesce` set `stopped=true` and `return 0` on timeout,
  then EVERY caller must check `stopped` immediately after each recursive call, and the
  `tt.store(...)` at the end MUST be guarded by `if !stopped`. Otherwise the sentinel `0`
  is treated as a real score, gets written into the TT, and (since the TT is usually only
  cleared on `ucinewgame`) persists for the whole game. Because iterative deepening always
  gets interrupted mid-iteration, *every move* poisons the TT — and the faster/deeper the
  search, the more nodes get poisoned. Symptom: **the engine searches several plies deeper
  yet loses badly** (measured here: NMP+PVS reached depth 12 vs 7 but scored −107 Elo).
  No crash, no error — only mysterious weakness that gets worse the more you optimize.
  Always verify: root discards incomplete iterations AND interior nodes never store aborted scores.
- **⚠️⚠️ `chess` 3.2.0 `null_move()` does NOT update the Zobrist hash** — TT key collision
  that makes null-move pruning *actively harmful*. Two defects compound:
  (1) `impl Hash for Board` returns the raw internal `self.hash` field, which **omits
  en-passant** (only `get_hash()` XORs the EP term in);
  (2) `null_move()` flips `side_to_move` but **never XORs the SIDE_TO_MOVE term** → the
  null-moved position gets **the exact same TT key as the original**, while its score is
  sign-flipped under negamax. NMP therefore writes sign-inverted scores under the real
  position's key, and every later probe reads a catastrophically wrong eval.
  Only the NMP branch calls `null_move()`, so a no-NMP baseline is unaffected — the symptom
  is "the engine gets weaker the moment I enable NMP".
  **Fix — always build your own key, never trust the crate's `Hash`:**
  ```rust
  fn board_key(board: &Board) -> u64 {
      let mut h = DefaultHasher::new();
      board.get_hash().hash(&mut h);                        // includes en-passant
      (board.side_to_move() == Color::White).hash(&mut h);   // null_move() forgets this
      h.finish()
  }
  ```
  **Measured impact: the same search feature set went from −107.5 Elo to +470.4 Elo
  (21W/3D/0L over 24 games) from this 4-line fix — a ~577 Elo swing.**
  General rule: with any third-party board library, assume its incremental hash may omit
  side-to-move / en-passant / castling rights, especially for "non-normal move" APIs.
- **⚠️⚠️ PST orientation must be verified numerically, not by eye.** Piece-square tables are
  almost always *written* visually (row 0 = rank 8 = Black's back rank), but `chess`'s
  `Square::to_index() = rank*8 + file` with `Rank::First`(rank 1) = 0, i.e. **a1 = 0**.
  So **White needs `63 - idx`** and Black uses `idx` — getting it backwards flips the whole
  table vertically **for both colors**. This engine had exactly that bug:
  White pawn on e2 scored **+50** and on e7 **−20** (rewarding *not* advancing pawns);
  White king on e1 **−50**, on castled g1 **−40**, but on g8 (deep in enemy camp) **+30**
  (actively marching the king into the opponent's position mid-game).
  Pawn + king are the two heaviest PST terms, so the engine's entire positional sense was
  inverted. **Test**: print `pst_val` for pawn e2/e4/e7 and king e1/g1/g8 before trusting it —
  a promoting pawn must outscore a home pawn, and a castled king must outscore an advanced one.
  Note `63 - idx` is a 180° rotation, equivalent to a vertical flip **only because these
  tables are left-right symmetric** — verify that before relying on it.
- **my-engine prints UCI `info` to STDERR** (`eprintln!`), `bestmove` to STDOUT. When
  scraping engine output, read info from stderr, bestmove from stdout.
- **Python env split**: `torch 2.2.2` is in `/usr/bin/python3` (3.9) which lacked `chess`
  → `python3 -m pip install --user chess`. The managed venv has `chess`+`onnxruntime` but
  NO torch. Train with system py3.9; golden-test with venv py3.13.
- **`match.py` MUST run under `/usr/bin/python3`** (it needs `chess`; the managed
  py3.13 at `~/.workbuddy/binaries/python/...` does NOT have it). Running it under the
  managed python dies instantly with `ModuleNotFoundError: No module named 'chess'`.
  If launched as a background job with output piped, this failure is **completely silent** —
  no result JSON is ever written and the job just vanishes. Always redirect background
  runs to a log file (`> /tmp/x.log 2>&1`) and check the log, never a bare pipe.
  (`make_self_teacher.py` needs no `chess`, so managed py3.13 is fine there.)
- **Background jobs die when the agent turn ends — and `nohup ... &` does NOT save them.**
  Backgrounding inside a *foreground* shell call gets killed when that call returns (symptom:
  empty log, no traceback, no result JSON). The only reliable way is the Bash tool's own
  `run_in_background: true` mechanism, plus a log redirect (`> /tmp/x.log 2>&1`).
  Verify liveness with `pgrep -fl match.py` — `ps` and `top` are sandbox-blocked here.
- **Long timed matches vs CPU-heavy training**: a `sleep 120`-style poll can be killed
  (exit 137); poll with short sleeps instead. If a torch training run must overlap a timed
  match, `renice +19 -p <pid>` the trainer so the engines keep CPU priority — otherwise both
  engines search shallower and the measured Elo gap is compressed.
- **Label encoding**: `from*64+to` (0..4095). Promotion is NOT encoded (move-gen handles
  it). Never try to predict promotion as a class.
- **Tensor layout (must match Rust `policy.rs` exactly)**: `(13,8,8)`, channels
  `P N B R Q K p n b r q k` (0..11) + stm plane (12, =1 when Black to move). `row0 = rank8`.
- **`policy.bin` byte order**: `c1w(16*13*9) c1b(16) c2w(16*16*9) c2b(16) f1w(64*1024)
  f1b(64) f2w(4096*64) f2b(4096)`, each C-order `.ravel()`, float32 little-endian.
  Total = 1,344,192 bytes (336,048 params). Mismatch ⇒ Rust `load` returns None silently.
- **The golden test does NOT cover the Rust FEN→tensor path.** `policy_golden_test.py` builds
  the input with its *own Python* `fen_to_flat` and feeds it to both the Python replica and
  ONNX — so it proves the **weights + layer math**, never the real `policy.rs` encoder.
  A mismatch between `policy.rs::predict` and `train_policy.py::fen_to_tensor` would pass the
  golden test while the live engine feeds the net garbage. Verify by hand.
  Audited 2026-08-12 and currently **consistent**: channels `P N B R Q K p n b r q k` (0..11);
  board `row0 = rank8` (Rust uses `rank_i = 7 - rank.to_index()`); plane 12 = 1 iff Black to move;
  labels `from*64+to` with `a1 = 0` (`uci_to_label` == `pack_move`).
  Note the tensor is rank-flipped (row0=rank8) while labels are not (a1=0) — a deliberate
  asymmetry that is fine *because both sides apply it identically*; don't "fix" one alone.
- **Policy only biases move ORDERING**, not the final move — so at shallow depth top-1
  move may be identical with/without policy. Measure strength with full matches, not
  "first move changed".
- **Disable policy for ablation**: UCI `setoption name Policy value false`, or run the
  binary from a dir without `policy.bin`.
- **Never overwrite committed `policy.pt`/`policy.onnx` with a toy smoke-test model** —
  train into a temp `--data` subset then `git checkout` to restore if you abort.
- **UCI harness "engine hang" is almost always a PYTHON bug, not the engine.** Two classic
  traps when driving my-engine over subprocess:
  (a) blocking `proc.stdout.readline()` with a "deadline" checked only AFTER the line
  returns — if the engine is ever slow it blocks FOREVER (the deadline is never reached).
  (b) never draining `stderr` during a search — the engine writes `info` lines to stderr;
  once the OS 64KB pipe fills, the engine blocks on its own `eprintln!` → true deadlock that
  looks exactly like an engine infinite loop. **Robust pattern**: run a background thread that
  continuously reads (and discards) stderr; read bestmove via a dedicated reader thread +
  `threading.Event` with a real wall-clock timeout; on timeout, `proc.kill()` + relaunch and
  skip the position. Verified: the engine (with 50M node cap + qsearch + depth fix) terminates
  on every position; all prior "hangs" were this harness bug. See `make_self_teacher.py`.
- **`go movetime N` without explicit `depth` was being capped at depth 6** in `parse_go`
  (default depth=6, loop stopped there, wasting the rest of the time budget). Fix: when
  `movetime>0 && !has_depth`, set `eff_depth=64` so iterative deepening uses the full budget.
- **quiescence + null-move + PVS + check-extension** are the highest-ROI search upgrades.
  NMP must guard: depth>=3, not-in-check, and skip when the side to move has only K/pawns
  (zugzwang). PVS: first child full window, rest null window `(-alpha-1,-alpha)` + re-search
  on fail-high. Check extension: at the qsearch frontier when `in_check`, `depth=1` (cap ply<48
  to avoid runaway). These took startpos from depth 7 → 11 in the same 1s budget.
- **An invalid FEN is silently swallowed → your whole test is fake.** `parse_position` does
  `Board::from_str(fen).unwrap_or_default()`, so an illegal FEN makes the engine **search the
  start position** while still happily printing a `bestmove` (`e2e4`/`b1c3`). Two hand-written
  probe FENs (`k7/8/8/8/8/8/8/K6Q w`, `7k/8/8/8/8/8/8/K6Q w`) were illegal — the black king was
  in check with White to move (h1–a8 diagonal / h-file) — and chess 3.2.0 correctly rejected
  them; only the two engines printing *identical* output exposed it.
  **Rule: pre-validate every hand-written FEN with `chess.Board(fen).is_valid()` (python-chess)
  before feeding it to the engine.**
- **chess 3.2.0 `Board` keeps NO move history and NO halfmove clock** → an engine built on it is
  blind to **repetition and the 50-move rule** unless the UCI layer rebuilds both. Symptoms:
  it repeats moves away a won game, and never steers into a saving repetition when lost.
  Fix: `parse_position` returns `(Board, Vec<u64> position keys, u32 halfmove)`; clear the key
  list and zero the clock on every irreversible move (capture / pawn move); parse FEN field 4
  yourself (the crate drops it). Pass both into `search()`.
  Measured on the KQ-vs-K probe: before → `cp 99987` (a mate that lies beyond the 50-move
  boundary, i.e. pure illusion); after → `cp 0`.
  Three implementation details that are easy to get wrong:
  (a) the draw test must run **before** the check-extension / qsearch transition, or repetitions
  at the search frontier are invisible;
  (b) track the ancestor path with `self.path.truncate(ply)` at node entry instead of paired
  push/pop — `alpha_beta` has ~5 `return` sites and one missing `pop` makes the path grow
  without bound. Invariant: on entering a node at ply *p*, `path` holds exactly *p* ancestors;
  deeper leftovers from a sibling subtree get truncated automatically;
  (c) **disable** repetition/50-move scoring inside null-move subtrees (a `null_ply` counter) —
  a null move is not a real move, so a "repetition" there is meaningless and injects fake draw
  scores into NMP cutoffs.
- **Aspiration windows**: parameterize `root_search(alpha, beta)` and search
  `[prev-δ, prev+δ]` (δ=30, ×3 on fail, full window above ~1200). If you do this you MUST also
  fix the root TT store — the old code wrote `flag=0` (exact) unconditionally, which is a real
  bug once the root can fail low/high.

## Quick Reference
| Script | Purpose |
|---|---|
| `dataset_gen.py` | UCI self-play → JSONL/PGN |
| `make_self_teacher.py --movetime 300` | SELF-DISTILL labels (engine's OWN bestmove, Policy OFF) |
| `make_teacher.py --depth 10` | Stockfish teacher labels (foreign-engine, usually NOT helpful) |
| `train_policy.py --data X.jsonl` | augmented CNN training |
| `export_weights.py` | policy.pt → policy.bin |
| `policy_golden_test.py` | Rust-inference vs ONNX proof |
| `match.py --eng E --policy-a P1 --policy-b P2 --games N` | Elo match |

## Common Mistakes
- Reading engine `info` from stdout (gets null scores) — use stderr.
- Augmenting without legality filter (teaches illegal moves).
- Skipping the golden test (deploys a silently-wrong model).
- Judging policy by single-game ply count instead of a matched Elo.

## 测量方法论（血泪教训，改引擎前必读）

### 固定深度节点数什么时候能当棋力代理，什么时候不能
| 改动类型 | 节点基准是否有效 | 说明 |
|---|---|---|
| 走法排序 / 置换表 / 静态搜索过滤 | ✅ 有效 | 不改变"哪些走法会被搜"，节点↓ = 同样的搜索做得更快 |
| LMP / futility / razoring 等**前向裁剪** | ❌ 无效 | 本质是"少搜走法"，节点↓ 是定义上的必然，零信息量 |

实证：LMP+futility 固定深度 9 节点 **−60%**、WAC 3/4 不变、同时间偶尔 +1 层，
看起来是大胜；**96 局实测 Elo −69.7，CI [−134.4, −9.4]，LOS 1.2%**，显著变弱，已回滚。
凡是改变搜索走法集合的改动，**只能用对局验证**。

### 对局评测框架必须具备的三件事
否则测出来的 Elo 主要是运气（`star/match.py` 已全部实现）：
1. **开局分散 + 成对对局**：不要所有对局都从初始局面开跑——固定 movetime 下引擎差异只来自
   时间抖动，等于拿噪声当样本多样性。内置 30 条均衡开局，相邻两局同一开局交换先后手。
2. **并行**：`--concurrency N`。movetime 是每步固定思考时间而非挂钟制，并行不会让谁少想；
   8 核跑 4 路安全，吞吐 ~4×。每槽位要有**独立的一对引擎实例+工作目录**。
3. **CI 不能用胜率二项近似**（等于假设没有和棋）：对每局得分(1/0.5/0)算样本方差，
   SE = std/sqrt(n)，并输出 LOS。
效果：同样 ~16 分钟，分辨率从 ±147 Elo（24 局同开局）提升到 ±62 Elo（96 局）。

**24 局的 CI 宽达 ±150 Elo** —— 这个量级下测出的"+0 Elo"含义是"测不出来"，不是"没效果"。
小改动要么加大局数，要么用等价改写类的节点基准佐证。

### 已被实测否决的改动（别再重复实现）
- **渴望窗口 (aspiration windows)**：PVS + TT 已吃掉收益，失败高低位重搜是净开销。
- **SEE 排序降级**（SEE<0 的吃子排到安静走法之后）：节点 +14%（open 局面 +57%）。
  SEE 只是静态近似，靠后续战术获利的"亏损"吃子被排到最末，一旦它才是最佳着就要在最贵的位置全窗重搜。
- **LMP + 前向 futility**：见上，−69.7 Elo。

### 已被实测接受并保留的搜索杠杆（完整 Elo 归因链，逐项隔离）
逐级对比（policy-off 纯搜索、24/96 局 movetime300、交换先后手、CI 报告）：
- qsearch（基线）→ **keyfix**（TT/key 修复，含 chess 3.2.0 `null_move` Zobrist 缺陷修复）：**+470.4 Elo**（零败，决定性）
- → **pstfix**（PST 上下颠倒修复）：**+231.9 Elo**（零败，显著）
- → **evalv2**（tapered 评估+兵形+双象+车线）：**+137.0 Elo**（勉强显著）
- → **rep**（重复局面+50步规则检测，正确性缺陷非调参）：保留（24局 +0 实为测不出，SEE 节点−5%/+1层为硬证据）
- → **ttage**（置换表老化 age 字段）：**+10.9 Elo**（LOS 64%，不显著但修真实缺陷，保留）
- → **histmalus**（反证历史：安静走法截断时给先前安静走法 −depth² 惩罚）：**+25.4 Elo**，96局 CI[−38,+90] LOS 78%（安全类重排序，节点−3%、bestmove 不变，接受）
- 否决：**LMP+前向futility**（−69.7 Elo）、**SEE排序降级**（+14%节点）、**渴望窗口**（无收益）。
准则：改变"哪些走法被搜"的改动只能对局验证；走法排序/TT/静态过滤类可用节点基准佐证。

### history malus（反证历史）实现要点
- 在 `alpha_beta` 循环起点声明 `quiets:[u16;64]` + `nquiet`；未截断的安静走法（按 `board.piece_on(mv.get_dest()).is_none()` 判）在 `if alpha>=beta` 之后追加记录。
- beta 截断且截断走法是安静走法时，对 `quiets[..nquiet]` 施加 `self.history[qm] = self.history[qm].saturating_sub(depth*depth)`。
- 注意：记录必须在截断判断**之后**（截断走法本身不该被惩罚）；`history` 数组同时被 policy 注入与 malus 修改，二者在内部节点叠加，不冲突。
- 这是安全类改动：固定深度节点↓ + bestmove 不变即方向正确信号，但仍需对局确认 Elo 方向。

### Rust / 沙箱小坑
- **`gen` 是 Rust 2024 保留字**，置换表老化的代号字段要命名为 `age`（或 `r#gen`）。
- 置换表 `store()` 的替换策略必须带**老化**：只判「空槽 or depth >= 已有 depth」会导致
  深条目占死槽位（连 key 都不比），后续不同局面的浅条目永远写不进去，一整局命中率持续下降。
  正确判据：空槽 or 同 key or 代号不同(陈旧) or depth >= 已有。
- 后台跑长任务**不要用 `nohup ... &`**：父 shell 退出后进程被杀（日志只剩表头）。用工具自带的后台执行。
- 本沙箱 `ps` 不可用（operation not permitted），用 `pgrep -fl` 查进程。
