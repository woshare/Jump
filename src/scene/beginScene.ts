class beginScene extends eui.Component implements  eui.UIComponent {
	public title:eui.Label;
	public image:eui.Image;
	public beginBtn:eui.Button;
    public test:egret.tween.TweenGroup;
	public constructor() {
		super();
	}

	protected partAdded(partName:string,instance:any):void
	{
		super.partAdded(partName,instance);
	}


	protected childrenCreated():void
	{
		super.childrenCreated();
		this.init();
		this.test.play();
	}
	//为开始按钮添加点击事件
	private init()
	{
		this.beginBtn.addEventListener(egret.TouchEvent.TOUCH_TAP,this.startHandle,this);
	}
	//开始按钮事件，开始游戏
	private startHandle()
	{
		//切换场景
		
		sceneManager.getInstance().changeScene('gamescene');
	}
	//移除事件
	public release()
	{
		if(this.beginBtn.hasEventListener(egret.TouchEvent.TOUCH_TAP))
		{
			this.beginBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP,this.startHandle,this);
		}
	}
}