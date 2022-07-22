const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    const { mountChildren, patchChildren, move } = internals;
    if (!n1) {
      const target = document.querySelector(n2.props.to);
      if (target) {
        // 挂载
        mountChildren(n2.children, target);
      }
    } else {
      // 更新
      patchChildren(n1, n2, container); // 儿子内容变化 还是在老容器中发生的更新
      if (n2.props.to !== n1.props.to) {
        // 传送位置发生改变
        const nextTarget = document.querySelector(n2.props.to);
        // 将孩子移动到新的容器中
        n2.children.forEach((child) => move(child, nextTarget));
      }
    }
  },
};
export { TeleportImpl as Teleport };
export const isTeleport = (type) => type.__isTeleport;
