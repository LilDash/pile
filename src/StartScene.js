var StartLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
 
        var size = cc.winSize;


        // menu
        var startItem = new cc.MenuItemFont(
                    "Start",
                    function () {
                        cc.director.runScene(new PlayScene());
                    }, this);
        startItem.attr({
            x: size.width/2,
            y: size.height / 2 - 60,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = new cc.Menu(startItem);
        menu.x = 0;
        menu.y = 0;

        this.addChild(menu, 1);

 
        return true;
    }
});
 
var StartScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new StartLayer();
        this.addChild(layer);

    }
});