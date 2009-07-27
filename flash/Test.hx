class Player {
    static var loader;
    static function main() {
        // You must allow justin.tv; for simplicity of developing against localhost as well I've allowed *
        flash.system.Security.allowDomain("*");

        var stage = flash.Lib.current.stage;
        // You must use these settings; otherwise our player will go crazy. You should be using these settings anyway because they're better.
        stage.scaleMode = flash.display.StageScaleMode.NO_SCALE;
        stage.align = flash.display.StageAlign.TOP_LEFT;

        // Create the loader!
        loader = new flash.display.Loader();

        // When we're done loading, trigger the callback
        loader.contentLoaderInfo.addEventListener(flash.events.Event.COMPLETE, loaded);
        // Load the player at 640x480 size (video will be automatically letterboxed properly)
        loader.load(new flash.net.URLRequest("http://www.justin.tv/widgets/live_api_player.swf?video_height=300&video_width=400&consumer_key=API_KEY_HERE")); 

    }

    static function loaded(e){
        // Add the loader to the stage
        flash.Lib.current.addChild(loader);
        var api = Reflect.field(loader.content,"api");
        var channel = flash.Lib.current.loaderInfo.parameters.channel;
        api.play_live(channel);
    }
}
