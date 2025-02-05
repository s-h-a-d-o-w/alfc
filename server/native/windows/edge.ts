import edge from "edge-js";
import path from "path";

// Edge.js requires an input and an output, hence null/null as default
export function createEdgeFunc<A = null, R = null>(
  dllName: string,
  methodName: string,
) {
  const edgeFn = edge.func<A, R>({
    assemblyFile: path.join(__dirname, dllName),
    methodName,
  });

  return (arg: A, cb: (error: Error, result: R) => void) => {
    edgeFn(arg, cb);
  };
}
