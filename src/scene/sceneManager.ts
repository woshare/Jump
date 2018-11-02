class sceneManager extends egret.Sprite {
	
	//场景管理器单实例
	private static instance:sceneManager;
	private beginscene:beginScene;
	private gamescene:gameScene;

	public constructor() {
		super();
		this.init();
	}

	 private init()
	{
		this.beginscene=new beginScene();
		this.gamescene=new gameScene();
		this.addChild(this.beginscene);
	} 
	public static getInstance():sceneManager
	{
		if(!sceneManager.instance)
		{
			sceneManager.instance=new sceneManager();
		}
		return sceneManager.instance;
	}
	public changeScene(scene)
	{
		if(scene=='gamescene')
		{
			this.beginscene.release();
		}
		this.removeChildren();
		this.addChild(this[scene]);
	}
}