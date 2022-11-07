/**
 * 节点工具
 * @author 陈皮皮 (ifaswind)
 * @version 20211208
 * @see NodeUtil.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/utils/NodeUtil.ts
 */
export default class NodeUtil {

    /**
     * 获取节点在目标节点（容器）下的相对位置
     * @param node 节点
     * @param container 目标节点（容器）
     */
    public static getRelativePosition(node: cc.Node, container: cc.Node): cc.Vec2 {
        const worldPos = (node.getParent() || node).convertToWorldSpaceAR(node.getPosition());
        return container.convertToNodeSpaceAR(worldPos);
    }

    /**
     * 坐标是否在目标节点范围内
     * @param pos 坐标
     * @param target 目标节点
     */
    public static isPosOnNodeRect(pos: cc.Vec2, target: cc.Node): boolean {
        const rect = target.getBoundingBoxToWorld();
        return rect.contains(pos);
    }

    /**
     * 两个节点是否重叠
     * @param node1 节点 1
     * @param node2 节点 2
     * @param contains 是否完全包含
     */
    public static areNodesOverlap(node1: cc.Node, node2: cc.Node, contains: boolean = false): boolean {
        const rect1 = node1.getBoundingBoxToWorld(),
            rect2 = node2.getBoundingBoxToWorld();
        return contains ? rect1.containsRect(rect2) : rect1.intersects(rect2);
    }

    /**
     * 获取节点本身在世界坐标系下的对齐轴向的包围盒（不包含子节点）
     * @param node 节点
     */
    public static getNodeSelfBoundingBoxToWorld(node: cc.Node) {
        node.parent['_updateWorldMatrix']();
        const { width, height } = node.getContentSize(),
            anchorPoint = node.getAnchorPoint(),
            rect = cc.rect(
                -anchorPoint.x * width,
                -anchorPoint.y * height,
                width,
                height
            );
        node['_calculWorldMatrix']();
        rect.transformMat4(rect, node['_worldMatrix']);
        return rect;
    }

}
