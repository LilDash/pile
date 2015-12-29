var PlayLayer = cc.Layer.extend({
  
    cellSize:30,
    rowCells:8,
    colCells:12,
    gridOffsetX:null,
    gridOffsetY:null,
    wrapPaddingX:25,
    wrapPaddingY:40,
    safeLine:8,

    gridLayer:null,
    wrapLayer:null,
    readyLayer:null,
    continueLayer:null,

    timerNode:null,

    speed:null,
    movingLength:null,
    curRow:0,
    curPos:0,
    movingCells:null,
    movingRight:true,
    surviveCells:null,
    interval:0.05,
    time:0,
    timeout:5,

    isMoving:false,


    ctor:function () {
        this._super();
 
        var size = cc.winSize;
        
        // init member var
        this.gridOffsetX = (size.width - this.cellSize*this.rowCells)/2;
        this.gridOffsetY = 95;

        this.speed = 0.3;        
        this.movingLength = 3;
        this.movingCells = [];
        this.surviveCells = [];

        // backgound
        var bgLayer = new cc.LayerColor(cc.color(250,248,239));
        this.addChild(bgLayer, 0);

        // ready layer
        this.readyLayer = new cc.Layer();
        this.addChild(this.readyLayer, 10);

        // wrap layer
        this.wrapLayer = new cc.Layer();
        this.addChild(this.wrapLayer, 1);
        // grid layer
        this.gridLayer = new cc.Layer();
        this.addChild(this.gridLayer, 2);
        
        this.createWrap();
        this.createGrid();
        this.createTimer();
        this.createCells();

         // menu
        var button = new cc.MenuItemImage(res.Start_N_png, res.Start_S_png, function () {
            this.onButtonStop();
        }, this) ;
        button.attr({x: size.width/2, y: 40, anchorX: 0.5, anchorY: 0.5, scale:0.8});
        var menu = new cc.Menu(button);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 2);

        this.readyCount();
        

        return true;
    },

    createWrap:function(){
        // wrap
        var wrapNode = new cc.DrawNode();
        var wrapOrigin = cc.p(this.gridOffsetX - this.wrapPaddingX, this.gridOffsetY - this.wrapPaddingY);
        var wrapDest = cc.p(this.gridOffsetX+this.rowCells*this.cellSize + this.wrapPaddingX, this.gridOffsetY+this.colCells*this.cellSize);
        wrapNode.drawRect(wrapOrigin, wrapDest, cc.color(187,173,160), 0, cc.color(187,173,160));
        this.wrapLayer.addChild(wrapNode);
        //button 
        var btnBgSprite = new cc.Sprite(res.Button_Bg_png);
        btnBgSprite.attr({ x: cc.winSize.width / 2, y: 40, scale:0.7 });
        this.wrapLayer.addChild(btnBgSprite, 1);
        var btnSprite = new cc.Sprite(res.Button_png);
        btnSprite.attr({ x: cc.winSize.width / 2, y: 40, scale:0.7 });
        this.wrapLayer.addChild(btnSprite, 2);
        // balance icon
        var coinSprite = new cc.Sprite(res.Coin_png);
        coinSprite.attr({x:20, y:cc.winSize.height - 10, scale:0.55});
        this.wrapLayer.addChild(coinSprite, 2);
        //balance text
        //var textBalance = new cc.LabelTTF("" + h5g.getUserBalance(), "Arial", 14);
        //textBalance.attr({x:cc.winSize.width * 0.1, y:cc.winSize.height - 10, anchorX:0, anchorY:0.5});
        //textBalance.setFontFillColor(cc.color(236,141,85));
        //this.wrapLayer.addChild(textBalance, 2);
    },

    createGrid:function(){
        var gridNode = new cc.DrawNode();
        for (var i = 0; i < this.rowCells; i++) {
            for(var j = 0; j < this.colCells; j++){
                var origin = cc.p(this.gridOffsetX+i*this.cellSize, this.gridOffsetY+j*this.cellSize);
                var destination = cc.p(this.gridOffsetX+i*this.cellSize+this.cellSize, this.gridOffsetY+j*this.cellSize+this.cellSize);
                if(j < this.safeLine){
                    gridNode.drawRect(origin, destination, cc.color(205,193,180), 2, cc.color(187,173,160));
                }else{
                    gridNode.drawRect(origin, destination, cc.color(237,224,200), 2, cc.color(187,173,160));
                }
            }
        };
        // safe line
        gridNode.drawSegment(
            cc.p(this.gridOffsetX - this.wrapPaddingX, this.gridOffsetY+this.safeLine*this.cellSize),
            cc.p(this.gridOffsetX+this.rowCells*this.cellSize + this.wrapPaddingX, this.gridOffsetY+this.safeLine*this.cellSize),
            2,
            cc.color(250,248,239)
            );
        // safe line text
        var text100l = new cc.LabelTTF("30", "Arial", 14);
        text100l.attr({x:this.gridOffsetX - this.wrapPaddingX + 12, y:this.gridOffsetY+this.safeLine*this.cellSize - 10});
        text100l.setFontFillColor(cc.color(237,224,200));
        this.gridLayer.addChild(text100l, 2);
        var text100r = new cc.LabelTTF("30", "Arial", 14);
        text100r.attr({x:this.gridOffsetX+this.rowCells*this.cellSize + this.wrapPaddingX - 12, y:this.gridOffsetY+this.safeLine*this.cellSize - 10});
        text100r.setFontFillColor(cc.color(237,224,200));
        this.gridLayer.addChild(text100r, 2);
        // top line
        gridNode.drawSegment(
            cc.p(this.gridOffsetX - this.wrapPaddingX, this.gridOffsetY+this.colCells*this.cellSize),
            cc.p(this.gridOffsetX+this.rowCells*this.cellSize + this.wrapPaddingX, this.gridOffsetY+this.colCells*this.cellSize),
            2,
            cc.color(242,121,121)
            );
        this.gridLayer.addChild(gridNode);
        // safe line text
        var text500l = new cc.LabelTTF("100", "Arial", 14);
        text500l.attr({x:this.gridOffsetX - this.wrapPaddingX + 12, y:this.gridOffsetY+this.colCells*this.cellSize - 10});
        text500l.setFontFillColor(cc.color(242,121,121));
        this.gridLayer.addChild(text500l, 2);
        var text500r = new cc.LabelTTF("100", "Arial", 14);
        text500r.attr({x:this.gridOffsetX+this.rowCells*this.cellSize + this.wrapPaddingX - 12, y:this.gridOffsetY+this.colCells*this.cellSize - 10});
        text500r.setFontFillColor(cc.color(242,121,121));
        this.gridLayer.addChild(text500r, 2);
    },

    createTimer:function(){
        var timerBgNode = new cc.DrawNode();
        var origin = cc.p(this.gridOffsetX, this.gridOffsetY-15);
        var destination = cc.p(this.gridOffsetX+this.rowCells*this.cellSize, this.gridOffsetY-10);
        timerBgNode.drawRect(origin, destination, cc.color(152,133,115), 0, cc.color(152,133,115));
        this.wrapLayer.addChild(timerBgNode, 1);

        this.timerNode = new cc.DrawNode();
        var origin = cc.p(this.gridOffsetX, this.gridOffsetY-15);
        var destination = cc.p(this.gridOffsetX+this.rowCells*this.cellSize, this.gridOffsetY-10);
        this.timerNode.drawRect(origin, destination, cc.color(121,242,223), 0, cc.color(121,242,223));
        this.wrapLayer.addChild(this.timerNode, 1);
    },

    createCells:function(){
        for (var i = 0; i < this.rowCells; i++) {
            for(var j = 0; j < this.colCells; j++){
                var cell = new cc.DrawNode();
                var origin = cc.p(this.gridOffsetX+i*this.cellSize, this.gridOffsetY+j*this.cellSize);
                var destination = cc.p(this.gridOffsetX+i*this.cellSize+this.cellSize, this.gridOffsetY+j*this.cellSize+this.cellSize);
                if(j < this.safeLine){
                    cell.drawRect(origin, destination, cc.color(236,141,85), 2, cc.color(187,173,160));
                }else{
                    cell.drawRect(origin, destination, cc.color(242,121,121), 2, cc.color(187,173,160));
                }
                
                cell.setOpacity(0);
                this.gridLayer.addChild(cell, 2, j*this.rowCells+i);
                
            };
        };
    },

    lightUpCell:function(Tag){
        var cell = this.gridLayer.getChildByTag(Tag);
        cell.setOpacity(255);
    },

    lightOffCell:function(Tag){
        var cell = this.gridLayer.getChildByTag(Tag);
        cell.setOpacity(0);
    },

    update:function(){  
        this.isMoving = true; 
        this.move();
    },

    timerTick:function(){
        var percent = 1-this.time/this.timeout;
        if(this.time <= this.timeout){
            var origin = cc.p(this.gridOffsetX, this.gridOffsetY-15);
            var destination = cc.p(this.gridOffsetX+this.rowCells*this.cellSize*percent, this.gridOffsetY-10);
            this.timerNode.clear();
            this.timerNode.drawRect(origin, destination, cc.color(121,242,223), 0, cc.color(121,242,223));
            this.time = this.time+this.interval;
        }else{
            this.stopMoving();
        }
    },

    move:function(){
        // light off cells;
        for (var i = 0; i < this.movingCells.length; i++) {
            this.lightOffCell(this.movingCells[i]);
        };
        this.movingCells = [];
        // light up cells;
        var leftCellTag = this.curRow * this.rowCells + this.curPos;
        var rightCellTag = leftCellTag + this.movingLength -1;
        for (var i = leftCellTag; i <= rightCellTag; i++) {
            this.lightUpCell(i);
            this.movingCells.push(i);
        };
        if(this.movingRight){
            this.curPos += 1;
        }else{
            this.curPos -= 1;
        };
        if(!this.movingRight && this.curPos == 0){
            this.movingRight = !this.movingRight;
        }else if(this.movingRight && this.curPos == this.rowCells - this.movingLength){
            this.movingRight = !this.movingRight;
        };

    },

    doContinue:function(){
        this.movingCells = [];
        this.time = 0;
        this.schedule(this.update, this.speed, cc.kCCRepeatForever, 0);
        this.schedule(this.timerTick, this.interval, cc.kCCRepeatForever, 0);
        //h5g.notify({'cur_row':this.curRow});
    },

    onButtonStop:function(){
        this.stopMoving();
    },

    stopMoving:function(){
        if(this.curRow < this.colCells && this.isMoving){
            this.unschedule(this.update);
            this.unschedule(this.timerTick);
            this.isMoving = false;
            var dieNum = this.killCells();
            this.movingLength = this.movingLength - dieNum;
            
            this.curRow += 1;
            
            if(this.movingLength == 0){
                // game over
                this.gameOver();
            }else if(this.curRow == this.colCells){
                // win
                this.gameWin();
            }else{

                // next row
                if(this.curRow%2 == 1){
                    if(this.curRow > this.safeLine){
                        this.speed = this.speed*0.6;
                    }else{
                        this.speed = this.speed*0.8;        
                    }
                };
                if(cc.random0To1() > 0.5){
                    this.curPos = 0;
                    this.movingRight = true;
                }else{
                    this.curPos = this.rowCells - this.movingLength;
                    this.movingRight = false;
                };
                
                if(this.curRow == this.safeLine){
                    this.reachSafeLine();
                }else{
                    this.doContinue();
                };
                
            };
        };
    },

    killCells:function(){
        if(this.curRow == 0){
            this.surviveCells = this.movingCells;
            return 0;
        }else{
            var tSurviveCells = this.surviveCells;
            var dieCells = [];
            for (var i = 0; i < this.movingCells.length; i++) {
                // find out if there is a cell under it
                var die = true;
                var tag = this.movingCells[i] - this.rowCells;
                for (var j = 0; j < tSurviveCells.length; j++) {
                    if(tSurviveCells[j] == tag){
                        // yes, there is!
                        this.surviveCells.push(this.movingCells[i]);
                        die = false;
                        break;
                    }
                };
                if(die){
                    dieCells.push(this.movingCells[i]);
                }
            };
            
            for (var i = 0; i < dieCells.length; i++) {
                //this.lightOffCell(dieCells[i]);
                this.gridLayer.getChildByTag(dieCells[i]).runAction(new cc.FadeOut(0.8));
            };
            return dieCells.length;
        };
    },

    gameOver:function(){
        this.unschedule(this.timerTick);
        this.gameOverAnim();
        var gameOver = new cc.LayerColor(cc.color(225,225,225,100));
        var size = cc.winSize;

        var btnBgSprite1 = new cc.Sprite(res.Button2_png);
        btnBgSprite1.attr({x: cc.winSize.width / 2, y: cc.winSize.height / 2 + 40});
        gameOver.addChild(btnBgSprite1, 1);
        var btnBgSprite2 = new cc.Sprite(res.Button1_png);
        btnBgSprite2.attr({x: cc.winSize.width / 2, y: cc.winSize.height / 2 - 40});
        gameOver.addChild(btnBgSprite2, 1);


        var GameOverItem = new cc.MenuItemImage(
                res.Text3_png, res.Text3_png,
                null, this);
        GameOverItem.attr({x: size.width/2, y: size.height / 2 + 40, anchorX: 0.5, anchorY: 0.5});

        var TryAgainItem = new cc.MenuItemImage(
                res.Text4_png, res.Text4_png,
                function () {
                    //h5g.restart();
                    //cc.director.runScene(new PlayScene());
                }, this);
        TryAgainItem.attr({x: size.width/2, y: size.height / 2 - 40, anchorX: 0.5, anchorY: 0.5});
 
        var menu = new cc.Menu(GameOverItem, TryAgainItem);
        menu.x = 0;
        menu.y = 0;
        gameOver.addChild(menu, 1);
        this.getParent().addChild(gameOver);
        //h5g.gameOver();
    },

    gameOverAnim:function(){
        for (var i = 0; i < this.curRow; i++) {
            for (var j = 0; j < this.rowCells; j++) {
                var tag = i*this.rowCells + j;
                this.gridLayer.getChildByTag(tag).runAction(new cc.Sequence(new cc.delayTime(0.3*i), new cc.FadeOut(0.3)));
            };
        };
    },

    gameWin:function(){
        this.unschedule(this.timerTick);
        for (var i = 0; i < this.movingCells.length; i++) {
            var tag = this.movingCells[i];
            for (var j = tag; j >= 0; j=j-this.rowCells) {
                var action = new cc.RepeatForever(new cc.Sequence(new cc.FadeOut(0.3), new cc.FadeIn(0.3)));
                this.gridLayer.getChildByTag(j).runAction(action);
            };
        };
        //h5g.win();
        // for (var i = 0; i < this.surviveCells.length; i++) {
        //     var tag = this.surviveCells[i];
        //     var action = new cc.RepeatForever(new cc.Sequence(new cc.FadeOut(0.3), new cc.FadeIn(0.3)));
        //     this.gridLayer.getChildByTag(tag).runAction(action);
           
        // };
    },

    reachSafeLine:function(){
        this.continueLayer = new cc.LayerColor(cc.color(225,225,225,100));
        var size = cc.winSize;

        var boxSprite = new cc.Sprite(res.Box_png);
        boxSprite.attr({x:size.width / 2, y:size.height / 2, scaleX:1.8});
        this.continueLayer.addChild(boxSprite, 1);

        var iconSprite = new cc.Sprite(res.Four_png);
        iconSprite.attr({x:size.width * 0.1, y:size.height * 0.68, scale:0.8});
        this.continueLayer.addChild(iconSprite, 2);

        this.boxText(boxSprite);

        var btnBgSprite1 = new cc.Sprite(res.Button2_png);
        btnBgSprite1.attr({x: size.width * 0.3, y: size.height * 0.4, scale:0.7});
        this.continueLayer.addChild(btnBgSprite1, 1);
        var btnBgSprite2 = new cc.Sprite(res.Button1_png);
        btnBgSprite2.attr({x: size.width * 0.7, y: size.height * 0.4, scale:0.7});
        this.continueLayer.addChild(btnBgSprite2, 1);

        var RewardItem = new cc.MenuItemImage(
                res.Text2_png, res.Text2_png,
                function () {
                    this.continueLayer.removeFromParent();
                    this.gameWin();
                    //h5g.notify({'safe_line_win':1, 'cur_row':this.curRow});
                }, this);
        RewardItem.attr({ x: size.width * 0.3, y: size.height * 0.4, scale:0.7});
        var ContinueItem = new cc.MenuItemImage(
                res.Text1_png, res.Text1_png,
                function () {
                    this.continueLayer.removeFromParent();
                    this.doContinue();
                }, this);
        ContinueItem.attr({x: size.width * 0.7, y: size.height * 0.4, scale:0.7});

        var menu = new cc.Menu(RewardItem, ContinueItem);
        menu.x = 0;
        menu.y = 0;
        this.continueLayer.addChild(menu, 1);
        this.addChild(this.continueLayer, 10);
    },

    boxText:function(box){
        var boxBox = box.boundingBox();
        var size = cc.winSize;
        var fontColor = cc.color(118,108,100);
        var textStr = "您已获得100   ， 继续挑战可能赢得大奖500   ！如果失败， 您将失去已经获得的乐钻数量。";
        var text1 = new cc.LabelTTF(textStr, "Arial", 16, cc.size(boxBox.width-55, boxBox.height),cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_TOP);
        text1.attr({x:size.width / 2, y:size.height * 0.45 });
        text1.setFontFillColor(fontColor);

        var coinSprite1 = new cc.Sprite(res.Coin_png);
        coinSprite1.attr({x:size.width * 0.46, y:size.height * 0.61, scale:0.55});
        var coinSprite2 = new cc.Sprite(res.Coin_png);
        coinSprite2.attr({x:size.width * 0.46, y:size.height * 0.57, scale:0.55});
      
        this.continueLayer.addChild(text1, 2);
        this.continueLayer.addChild(coinSprite1, 3);
        this.continueLayer.addChild(coinSprite2, 3);
    },

    readyCount:function(){
        // the number text for counting down
        var size = cc.winSize;
        var Sprite3 = new cc.Sprite(res.Three_png);
        Sprite3.attr({x: size.width/2, y: size.height/2});
        var Sprite2 = new cc.Sprite(res.Two_png);
        Sprite2.setOpacity(0);
        Sprite2.attr({x: size.width/2, y: size.height/2});
        var Sprite1 = new cc.Sprite(res.One_png);
        Sprite1.attr({x: size.width/2, y: size.height/2});
        Sprite1.setOpacity(0);
        this.readyLayer.addChild(Sprite3, 1);
        this.readyLayer.addChild(Sprite2, 1);
        this.readyLayer.addChild(Sprite1, 1);
        // animation
        Sprite3.runAction(new cc.Sequence(new cc.delayTime(0.5), new cc.FadeOut(0.5)));
        Sprite2.runAction(new cc.Sequence(new cc.delayTime(1), new cc.FadeIn(0.1), new cc.delayTime(0.5), new cc.FadeOut(0.5)));
        Sprite1.runAction(new cc.Sequence(new cc.delayTime(2.1), new cc.FadeIn(0.1), new cc.delayTime(0.5), new cc.FadeOut(0.5),
                new cc.CallFunc(function(){this.doContinue();}, this)));
    }
});
 
var PlayScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new PlayLayer();
        this.addChild(layer);
    }
});
