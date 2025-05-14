declare module "react-force-graph-2d" {
  import { ComponentType, Ref } from "react";

  type ForceGraphProps = {
    graphData: {
      nodes: { id: string }[]; //ここでノードの型を具体化
      links: { source: string; target: string }[];
    };
    width?: number;
    height?: number;
    nodeLabel?: (node: any) => string;
    nodeAutoColorBy?: string;
    nodeCanvasObject?: (
      node: any,
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => void;
    linkDirectionalArrowLength?: number;
    linkDistance?: number;
    cooldownTicks?: number;
    onEngineStop?: () => void;
    onNodeClick?: (node: any) => void;
    linkDirectionalParticles?: number;
    linkDirectionalParticleSpeed?: number;
    backgroundColor?: string;
    linkColor?: () => string;
  };

  const ForceGraph2D: ComponentType<ForceGraphProps & { ref?: Ref<any> }>;
  export default ForceGraph2D;
}
