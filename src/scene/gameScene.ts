class gameScene extends eui.Component implements eui.UIComponent {

	public blockPanel: eui.Group;
	public gamingScore: eui.Label;
	public player: eui.Image;
	public gameOverPanel: eui.Group;
	public gameOverScoreLabel: eui.Label;
	public restart: eui.Button;

	//public bgImg:eui.Image;


	// 所有方块资源的数组
	private blockSourceNames: Array<string> = [];
	// 按下的音频
	private pushVoice: egret.Sound;
	// 按下音频的SoundChannel对象
	private pushSoundChannel: egret.SoundChannel;
	// 弹跳的音频
	private jumpVoice: egret.Sound;
	// 所有方块的数组
	private blockArr: Array<eui.Image> = [];
	// 所有回收方块的数组
	private reBackBlockArr: Array<eui.Image> = [];
	// 当前的盒子（最新出现的盒子）
	private currentBlock: eui.Image;
	// 下一个盒子方向(1靠右侧出现/-1靠左侧出现)
	public direction: number = 1;
	// 随机盒子距离跳台的距离
	private minDistance = 240;
	private maxDistance = 400;
	// tanθ角度值
	public tanAngle: number = 0.556047197640118;

	// 跳的距离
	public jumpDistance: number = 0;
	// 判断是否是按下状态
	private isReadyJump = false;
	// 落脚点
	private targetPos: egret.Point;
	// 左侧跳跃点
	private leftOrigin = { "x": 180, "y": 350 };
	// 右侧跳跃点
	private rightOrigin = { "x": 505, "y": 350 };
	// 游戏中得分
	private score = 0;
	public constructor() {
		super();
		//this.skinName="gameScene.exml";
	}

	protected partAdded(partName: string, instance: any): void {
		super.partAdded(partName, instance);
	}


	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
		this.reset();
	}
	private init() {
		this.blockSourceNames = ["block1_png", "block2_png", "block3_png"];
		// 初始化音频
		this.pushVoice = RES.getRes('push_mp3');
		this.jumpVoice = RES.getRes('jump_mp3');

		// 添加触摸事件
		this.blockPanel.touchEnabled = true;
		this.blockPanel.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onKeyDown, this);
		this.blockPanel.addEventListener(egret.TouchEvent.TOUCH_END, this.onKeyUp, this);
		// 绑定结束按钮
		this.restart.addEventListener(egret.TouchEvent.TOUCH_TAP, this.restartHandler, this);
		// 设置玩家的锚点
		this.player.anchorOffsetX = this.player.width / 2;
		this.player.anchorOffsetY = this.player.height - 20;

		// 心跳计时器,计算X轴的跳的距离
		this.startTime=egret.getTimer();
		egret.startTick(this.calculateDistance,this);

	}
	private startTime;
	private calculateDistance(timeStamp:number):boolean
	{
		let interval=timeStamp-this.startTime;
		if(this.isReadyJump)
		{
			this.jumpDistance+=300*interval/1000;//当点击按压小人图像时，isReadJump=true，则跳转的距离根据这个时间积蓄力量，可以跳的更远
		}
		this.startTime=timeStamp;
		return true;
	}
	// 按下的事件逻辑
	private onKeyDown() {
			// 播放按下的音频
		this.pushSoundChannel = this.pushVoice.play(0, 1);
		// 变形
		egret.Tween.get(this.player).to({
			scaleY: 0.5
		}, 3000)

		this.isReadyJump = true;
	}
	private createBlock():eui.Image
	{
		let blockNode=null;
		if(this.reBackBlockArr.length)
		{
			blockNode=this.reBackBlockArr.splice(0,1)[0];
		}
		else
		{
			blockNode=new eui.Image()
		}
		let rnd_i_img=Math.floor(Math.random()*this.reBackBlockArr.length);
		blockNode.source=this.blockSourceNames[rnd_i_img];
		this.blockPanel.addChild(blockNode);
		blockNode.anchorOffsetX = 222;
		blockNode.anchorOffsetY = 78;
		this.blockArr.push(blockNode);
		return blockNode;
	}


	// 放开
	private onKeyUp() {
		if(!this.isReadyJump)
			return;
		if(!this.targetPos)
		{
			this.targetPos=new egret.Point();
		}
		//屏幕不可点击，只有等小人落下后才可以再点击
		this.blockPanel.touchEnabled=false;

		this.pushSoundChannel.stop();
		this.jumpVoice.play(0,1);

		egret.Tween.removeAllTweens();

		this.blockPanel.addChild(this.player);

		this.isReadyJump=false;

		//跳转目标地址
		this.targetPos.x=this.player.x+this.jumpDistance*this.direction;

		this.targetPos.y=this.player.y+this.jumpDistance*(this.currentBlock.y-this.player.y)/(this.currentBlock.x-this.player.x)*this.direction;

		// 执行跳跃动画
		egret.Tween.get(this).to({ factor: 1 }, 500).call(() => {
			this.player.scaleY = 1;
			this.jumpDistance = 0;
			// 判断跳跃是否成功
			this.judgeResult();
		});
		// 执行小人空翻动画
		this.player.anchorOffsetY = this.player.height / 2;

		egret.Tween.get(this.player).to({ rotation: this.direction > 0 ? 360 : -360 }, 200).call(() => {
			this.player.rotation = 0
		}).call(() => {
			this.player.anchorOffsetY = this.player.height - 20;
		});
	}
	private judgeResult()
	{
			// 根据this.jumpDistance来判断跳跃是否成功
		if (Math.pow(this.currentBlock.x - this.player.x, 2) + Math.pow(this.currentBlock.y - this.player.y, 2) <= 70 * 70) {
			// 更新积分
			this.score++;
			this.gamingScore.text = this.score.toString();
			// 随机下一个方块出现的位置
			this.direction = Math.random() > 0.5 ? 1 : -1;
			// 当前方块要移动到相应跳跃点的距离
			var blockX, blockY;
			blockX = this.direction > 0 ? this.leftOrigin.x : this.rightOrigin.x;
			blockY = this.height / 2 + this.currentBlock.height;
			// 小人要移动到的点.
			var playerX, PlayerY;
			playerX = this.player.x - (this.currentBlock.x - blockX);
			PlayerY = this.player.y - (this.currentBlock.y - blockY);
			// 更新页面
			this.update(this.currentBlock.x - blockX, this.currentBlock.y - blockY);
			// 更新小人的位置
			egret.Tween.get(this.player).to({
				x: playerX,
				y: PlayerY
			}, 1000).call(() => {
				// 开始创建下一个方块
				this.addBlock();
				// 让屏幕重新可点;
				this.blockPanel.touchEnabled = true;
			})
			// console.log('x' + x);
			console.log(this.currentBlock.x);
		} else {
			// 失败,弹出重新开始的panel
			console.log('游戏失败!')
			this.gameOverPanel.visible = true;
			this.gameOverScoreLabel.text = this.score.toString();
		}
	}
	private update(x,y)
	{
		egret.Tween.removeAllTweens();
		for (var i: number = this.blockArr.length - 1; i >= 0; i--) {
			var blockNode = this.blockArr[i];
			if (blockNode.x + (blockNode.width - 222) < 0 || blockNode.x - 222 > this.width || blockNode.y - 78 > this.height) {
				// 方块超出屏幕,从显示列表中移除
				this.blockPanel.removeChild(blockNode);
				this.blockArr.splice(i, 1);
				// 添加到回收数组中
				this.reBackBlockArr.push(blockNode);
			} else {
				// 没有超出屏幕的话,则移动
				egret.Tween.get(blockNode).to({
					x: blockNode.x - x,
					y: blockNode.y - y
				}, 1000)
			}
		}
		console.log(this.blockArr);
	}
	// 重置游戏
	public reset() {
		this.blockPanel.removeChildren();
		this.blockArr=[];
		let blockNode=this.createBlock();
		blockNode.touchEnabled=false;

		blockNode.x=200;
		blockNode.y=this.height/2+blockNode.height;
		this.currentBlock = blockNode;
		this.player.x=this.currentBlock.x;
		this.player.y=this.currentBlock.y;
	
		//this.blockPanel.addChild(this.bgImg);
		this.blockPanel.addChild(this.player);
		this.direction=1;
		this.blockPanel.addChild(this.gamingScore);

		this.addBlock();
	}
	private addBlock()
	{
		let blockNode=this.createBlock();
		let distance=this.minDistance+Math.random()*(this.maxDistance-this.minDistance);

		blockNode.x=this.currentBlock.x+this.direction*distance;
		blockNode.y=this.currentBlock.y-distance*this.tanAngle;

		this.currentBlock=blockNode;
	}

		// 重新一局
	private restartHandler() {
			// 隐藏结束场景
		this.gameOverPanel.visible = false;
		// 置空积分
		this.score = 0;
		this.gamingScore.text = this.score.toString();
		// 开始防止方块
		this.reset();
		// 游戏场景可点
		this.blockPanel.touchEnabled = true;
	}
	//添加factor的set,get方法,注意用public  
	public get factor(): number {
		return 0;
	}
	//计算方法参考 二次贝塞尔公式  
	public set factor(value: number) {
		this.player.x = (1 - value) * (1 - value) * this.player.x + 2 * value * (1 - value) * (this.player.x + this.targetPos.x) / 2 + value * value * (this.targetPos.x);
		this.player.y = (1 - value) * (1 - value) * this.player.y + 2 * value * (1 - value) * (this.targetPos.y - 300) + value * value * (this.targetPos.y);
	}
}