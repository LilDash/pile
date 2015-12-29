cc.game.onStart = function(){
  		cc.view.adjustViewPort(true);
	    cc.view.setDesignResolutionSize(320, 480, cc.ResolutionPolicy.SHOW_ALL);
	    cc.view.resizeWithBrowserSize(true);
		//load resources
		cc.LoaderScene.preload(g_resources, function () {
		  cc.director.runScene(new PlayScene());
		  //cc.director.setDisplayStats(true);
		}, this);
    };



function startGame(){
	cc.game.run("gameCanvas");
}

startGame();