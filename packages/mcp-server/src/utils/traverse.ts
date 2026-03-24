/* eslint-disable @typescript-eslint/no-explicit-any */

export const traverseDom = (node: any, cb: (node: any) => any) => {
  const traverseRes = cb(node) ?? {};
  if (node.children && node.children.length > 0) {
    traverseRes.children = node.children.map((child: any) =>
      traverseDom(child, cb)
    );
  }
  return traverseRes;
};
