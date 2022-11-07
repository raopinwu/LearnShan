const { ccclass, property } = cc._decorator;

/**
 * 实例：Kawase 模糊（多 Pass）
 * @author 陈皮皮 (ifaswind)
 * @version 20211208
 * @see Case_MultipassKawaseBlur.ts https://gitee.com/ifaswind/eazax-cases/blob/master/assets/cases/multipassKawaseBlur/scripts/Case_MultipassKawaseBlur.ts
 * @see eazax-kawase-blur.effect https://gitee.com/ifaswind/eazax-ccc/blob/master/resources/effects/eazax-kawase-blur.effect
 * @see RenderUtil.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/utils/RenderUtil.ts
 */
@ccclass
export default class Case_MultipassKawaseBlur extends cc.Component {

    @property({ type: cc.Sprite, tooltip: CC_DEV && '精灵组件' })
    protected sprite: cc.Sprite = null;

    @property({ type: cc.Material, tooltip: CC_DEV && '渲染用的材质' })
    protected material: cc.Material = null;

    /**
     * 正在使用的 RenderTexture
     */
    protected renderTexture: cc.RenderTexture = null;

    /**
     * 生命周期：开始（首次 update 前）
     */
    protected start() {
        // 目标节点
        const sprite = this.sprite,
            node = this.sprite.node;
        // 设置材质
        const material = this.material;
        material.setProperty('resolution', cc.v2(node.width, node.height));
        // 创建临时 RenderTexture
        const srcRT = new cc.RenderTexture(),
            dstRT = new cc.RenderTexture();
        // 获取初始 RenderTexture
        this.getRenderTexture(node, srcRT);
        // 多 Pass 处理
        // 注：由于 OpenGL 中的纹理是倒置的，所以双数 Pass 的出的图像是颠倒的
        this.renderWithMaterial(srcRT, dstRT, material);
        this.renderWithMaterial(dstRT, srcRT, material);
        this.renderWithMaterial(srcRT, dstRT, material);
        this.renderWithMaterial(dstRT, srcRT, material);
        this.renderWithMaterial(srcRT, dstRT, material);
        // 使用经过处理的 RenderTexture
        this.renderTexture = dstRT;
        sprite.spriteFrame = new cc.SpriteFrame(this.renderTexture);
        // 销毁不用的临时 RenderTexture
        srcRT.destroy();
    }

    /**
     * 生命周期：销毁
     */
    protected onDestroy(): void {
        // 销毁不用的 RenderTexture
        this.renderTexture && this.renderTexture.destroy();
    }

    /**
     * 获取节点的 RenderTexture
     * @param node 节点
     * @param out 输出
     * @see RenderUtil.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/utils/RenderUtil.ts
     */
    protected getRenderTexture(node: cc.Node, out?: cc.RenderTexture) {
        // 检查参数
        if (!cc.isValid(node)) {
            return null;
        }
        if (!out || !(out instanceof cc.RenderTexture)) {
            out = new cc.RenderTexture();
        }
        // 获取宽高
        const width = Math.floor(node.width),
            height = Math.floor(node.height);
        // 初始化 RenderTexture
        out.initWithSize(width, height);
        // 创建临时摄像机用于渲染目标节点
        const cameraNode = new cc.Node();
        cameraNode.parent = node;
        const camera = cameraNode.addComponent(cc.Camera);
        camera.clearFlags |= cc.Camera.ClearFlags.COLOR;
        camera.backgroundColor = cc.color(0, 0, 0, 0);
        camera.zoomRatio = cc.winSize.height / height;
        // 将节点渲染到 RenderTexture 中
        camera.targetTexture = out;
        camera.render(node);
        // 销毁临时对象
        cameraNode.destroy();
        // 返回 RenderTexture
        return out;
    }

    /**
     * 使用指定材质来将 RenderTexture 渲染到另一个 RenderTexture
     * @param srcRT 来源
     * @param dstRT 目标
     * @param material 材质
     * @see RenderUtil.ts https://gitee.com/ifaswind/eazax-ccc/blob/master/utils/RenderUtil.ts
     */
    protected renderWithMaterial(srcRT: cc.RenderTexture, dstRT: cc.RenderTexture | cc.Material, material?: cc.Material) {
        // 检查参数
        if (dstRT instanceof cc.Material) {
            material = dstRT;
            dstRT = new cc.RenderTexture();
        }
        // 创建临时节点（用于渲染 RenderTexture）
        const tempNode = new cc.Node();
        tempNode.setParent(cc.Canvas.instance.node);
        const tempSprite = tempNode.addComponent(cc.Sprite);
        tempSprite.sizeMode = cc.Sprite.SizeMode.RAW;
        tempSprite.trim = false;
        tempSprite.spriteFrame = new cc.SpriteFrame(srcRT);
        // 获取图像宽高
        const width = srcRT.width,
            height = srcRT.height;
        // 初始化 RenderTexture
        dstRT.initWithSize(width, height);
        // 更新材质
        if (material instanceof cc.Material) {
            tempSprite.setMaterial(0, material);
        }
        // 创建临时摄像机（用于渲染临时节点）
        const cameraNode = new cc.Node();
        cameraNode.setParent(tempNode);
        const camera = cameraNode.addComponent(cc.Camera);
        camera.clearFlags |= cc.Camera.ClearFlags.COLOR;
        camera.backgroundColor = cc.color(0, 0, 0, 0);
        camera.zoomRatio = cc.winSize.height / height;
        // 将临时节点渲染到 RenderTexture 中
        camera.targetTexture = dstRT;
        camera.render(tempNode);
        // 销毁临时对象
        cameraNode.destroy();
        tempNode.destroy();
        // 返回 RenderTexture
        return dstRT;
    }

}
