type StatusItem = {
  stage: string;
  message: string;
  status: "in-progress" | "done";
};

type StepStatus = "pending" | "in-progress" | "done";

function getStepStatus(
  stageId: string,
  statusItems: StatusItem[]
): StepStatus {
  if (statusItems.some(s => s.stage === stageId && s.status === "done"))
    return "done";
  if (statusItems.some(s => s.stage === stageId && s.status === "in-progress"))
    return "in-progress";
  return "pending";
}

/* Real backend topology (resume-optimizer.service.ts):
 *   summarizing (gate)  ->  summary · skills · experience (parallel, Promise.all)  ->  formatting (join)
 * The three parallel branches resolve in arbitrary order, so this DAG makes NO
 * assumption about which finishes first — each node is coloured from its own status. */

type NodeDef = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  h: number;
  badgeR: number;
};

const GATE: NodeDef = {
  id: "summarizing",
  label: "Summarize",
  sub: "job description",
  x: 80,
  y: 24,
  w: 120,
  h: 52,
  badgeR: 11,
};

const BRANCHES: NodeDef[] = [
  { id: "experience", label: "Experience", sub: "", x: 8, y: 190, w: 84, h: 72, badgeR: 9 },
  { id: "skills", label: "Skills", sub: "", x: 98, y: 190, w: 84, h: 72, badgeR: 9 },
  { id: "summary", label: "Summary", sub: "", x: 188, y: 190, w: 84, h: 72, badgeR: 9 },
];

const JOIN: NodeDef = {
  id: "formatting",
  label: "Format",
  sub: "resume",
  x: 80,
  y: 396,
  w: 120,
  h: 52,
  badgeR: 11,
};

const CONNECTOR_IDLE = "hsl(220 13% 85%)";
const CONNECTOR_DONE = "hsl(142 71% 45% / 0.55)";

function statusColor(status: StepStatus) {
  switch (status) {
    case "done":
      return {
        badge: "hsl(142 71% 45%)",
        nodeFill: "hsl(0 0% 100%)",
        nodeStroke: "hsl(142 71% 45% / 0.45)",
        label: "hsl(222 47% 11%)",
        sub: "hsl(142 71% 38%)",
        subText: "done",
      };
    case "in-progress":
      return {
        badge: "hsl(221 83% 53%)",
        nodeFill: "hsl(221 83% 53% / 0.04)",
        nodeStroke: "hsl(221 83% 53% / 0.5)",
        label: "hsl(222 47% 11%)",
        sub: "hsl(221 83% 45%)",
        subText: "working",
      };
    case "pending":
    default:
      return {
        badge: "hsl(220 14% 96%)",
        nodeFill: "hsl(0 0% 100%)",
        nodeStroke: "hsl(220 13% 91%)",
        label: "hsl(220 9% 46%)",
        sub: "hsl(220 9% 55%)",
        subText: "waiting",
      };
  }
}

function NodeGlyph({
  node,
  status,
}: {
  node: NodeDef;
  status: StepStatus;
}) {
  const c = statusColor(status);
  const dashed = status === "pending";
  const opacity = status === "pending" ? 0.55 : 1;

  // The wider gate/join nodes carry descriptive sub-text (e.g. "job
  // description") and fit it horizontally. The three parallel branch nodes
  // are taller than wide, so a horizontal "badge + label to its right" layout
  // left only ~44px for the label — "Experience" (~50px) overflowed the
  // border. Stacking the branch content vertically and centring the text
  // matches the node's aspect ratio and gives every label equal padding on
  // both sides, so nothing can spill.
  const isBranch = node.badgeR <= 10;

  // Badge position: centred horizontally for branches; left-anchored for the
  // wider gate/join bookends.
  const cx = isBranch ? node.x + node.w / 2 : node.x + 22;
  const cy = isBranch ? node.y + 22 : node.y + node.h / 2;
  const r = node.badgeR;

  // Label anchor: centred for branches, left-aligned next to the badge
  // otherwise.
  const labelX = isBranch ? node.x + node.w / 2 : node.x + 40;
  const labelY = isBranch ? node.y + 44 : cy - 1;
  const subY = isBranch ? node.y + 56 : cy + 12;

  return (
    <g opacity={opacity}>
      <rect
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={10}
        fill={c.nodeFill}
        stroke={c.nodeStroke}
        strokeWidth={1.5}
        strokeDasharray={dashed ? "4 3" : undefined}
      />
      {/* badge */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={c.badge}
        stroke={status === "pending" ? "hsl(220 13% 85%)" : undefined}
      />
      {status === "done" && (
        <path
          d={`M${cx - r * 0.45} ${cy} l${r * 0.32} ${r * 0.4} l${r * 0.62} ${
            -r * 0.85
          }`}
          stroke="white"
          strokeWidth={2.1}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {status === "in-progress" && (
        <g
          className="animate-spin"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transformBox: "view-box",
          }}
        >
          <path
            d={`M${cx} ${cy - 5} A 5 5 0 1 1 ${cx - 4.3} ${cy + 2.5}`}
            stroke="white"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
      {status === "pending" && (
        <circle cx={cx} cy={cy} r={2} fill="hsl(220 9% 46% / 0.5)" />
      )}
      {/* labels */}
      <text
        x={labelX}
        y={labelY}
        textAnchor={isBranch ? "middle" : "start"}
        fontSize={node.badgeR > 10 ? 11 : 9.5}
        fontWeight={600}
        fill={c.label}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {node.label}
      </text>
      <text
        x={labelX}
        y={subY}
        textAnchor={isBranch ? "middle" : "start"}
        fontSize={node.badgeR > 10 ? 9 : 8.5}
        fill={c.sub}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {node.sub || c.subText}
      </text>
    </g>
  );
}

export function ProgressStepper({ statusItems }: { statusItems: StatusItem[] }) {
  const gateStatus = getStepStatus(GATE.id, statusItems);
  const branchStatuses = BRANCHES.map(b => getStepStatus(b.id, statusItems));
  const joinStatus = getStepStatus(JOIN.id, statusItems);

  // Gate -> branch connectors light up once the gate is done.
  const gateConnectors = branchStatuses.map(() =>
    gateStatus === "done" ? CONNECTOR_DONE : CONNECTOR_IDLE
  );
  // Branch -> join connectors light up per-branch as each completes
  // (arbitrary order — each is independent).
  const joinConnectors = branchStatuses.map(s =>
    s === "done" ? CONNECTOR_DONE : CONNECTOR_IDLE
  );

  // Curved fan-out / fan-in paths. Centres track the node geometry above.
  const cx = (n: NodeDef) => n.x + n.w / 2;
  const branchTops = BRANCHES.map(n => ({ x: cx(n), y: n.y }));
  const branchBots = BRANCHES.map(n => ({ x: cx(n), y: n.y + n.h }));
  const gateBot = { x: cx(GATE), y: GATE.y + GATE.h };
  const joinTop = { x: cx(JOIN), y: JOIN.y };
  const midY1 = (gateBot.y + BRANCHES[0].y) / 2;
  const midY2 = (BRANCHES[0].y + BRANCHES[0].h + JOIN.y) / 2;

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex flex-col h-full">
      <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-1">
        Optimization pipeline
      </p>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        <svg
          viewBox="0 0 280 460"
          className="w-full max-w-[300px] h-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Optimization pipeline"
        >
          {/* gate -> branches */}
          {branchTops.map((t, i) => (
            <path
              key={`g-${i}`}
              d={`M${gateBot.x} ${gateBot.y} C${gateBot.x} ${midY1}, ${t.x} ${midY1}, ${t.x} ${t.y}`}
              stroke={gateConnectors[i]}
              strokeWidth={1.5}
              fill="none"
            />
          ))}
          {/* branches -> join */}
          {branchBots.map((b, i) => (
            <path
              key={`j-${i}`}
              d={`M${b.x} ${b.y} C${b.x} ${midY2}, ${joinTop.x} ${midY2}, ${joinTop.x} ${joinTop.y}`}
              stroke={joinConnectors[i]}
              strokeWidth={1.5}
              fill="none"
            />
          ))}

          <NodeGlyph node={GATE} status={gateStatus} />
          {BRANCHES.map((b, i) => (
            <NodeGlyph key={b.id} node={b} status={branchStatuses[i]} />
          ))}
          <NodeGlyph node={JOIN} status={joinStatus} />
        </svg>
      </div>
    </div>
  );
}
