/* 
 This file was generated by Dashcode.  
 You may edit this file to customize your widget or web page 
 according to the license.txt file included in the project.
 */

//global variables
temp_vid = ''
temp_chat = ''
historystack = []
cur_channel = ''
chatout = false

//
// Function: load()
// Called by HTML body element's onload event when the widget is ready to start
//
function load()
{
    //load preferences, setup animations, and show a welcome message
    dashcode.setupParts();
    textfield.value = widget.preferenceForKey('username')
    box.innerHTML = 'Click Top Broadcasts, Favorites, or search to start watching live video'
    chatShowAnimator = new AppleAnimator(1000,20,0,465, chatwidthhandler)
    chatHideAnimator = new AppleAnimator(1000,20,465,0, chatwidthhandler)
    chatShowAnimatorv = new AppleAnimator(1000,20,400,500, chatheighthandler)
    chatHideAnimatorv = new AppleAnimator(1000,20,500,400, chatheighthandler)
}
function chatwidthhandler(currentAnimator, current, start, finish) {
    chat.style.width = current+'px'
}
function chatheighthandler(currentAnimator, current, start, finish) {
    chat.style.height = current+'px'
}

//
// Function: hide()
// Called when the widget has been hidden
//
function hide()
{
    //get rid of the video embed to not waste cpu
    old = box.innerHTML
    box.innerHTML = ''
}

//
// Function: show()
// Called when the widget has been shown
//
function show()
    //restore whatever was there before
{
    if (old) {
        box.innerHTML = old
    }
}

//switch to a video player
function show_video(channel) {
    save_history()
    box.innerHTML = '<span style="font-family:sans-serif; font-size:10pt;">You are watching '+channel + ' (<a href="javascript:widget.openURL(\'http://justin.tv/'+channel+'\')">Watch on justin.tv</a>)' +'</span>\n'
    box.innerHTML += '<object id="player" type="application/x-shockwave-flash" height="300" width="400" id="live_embed_player_flash" data="player.swf?channel='+channel+'" bgcolor="#000000"><param name="allowFullScreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="allownetworking" value="all" /><param name="movie" value="player.swf" /><param name="flashvars" value="channel='+channel+'&auto_play=false&start_volume=25" /></object>'
    cur_channel = channel
    if (chatout) {
        switch_chat(channel)
    }
}

//slide the chat tray in or out
function toggle_chat() {
    if(chatout) {
        hide_chat()
    } else if(cur_channel) {
        show_chat(cur_channel)
    }
}

//switch the chat to a different channel
function switch_chat(channel) {
    chat.innerHTML = '<iframe id="chatframe" scrolling="no" style="width:480px;height:500px;" src="http://www.justin.tv/chat/embed?channel='+channel+'&hide=myspace,facebook,twitter&default_chat=jtv"></iframe>'
}

//animate the chat out
function show_chat(channel) {
    chatout = true
    chat.style.display='block'
    chatHideAnimator.stop()
    chatHideAnimatorv.stop()
    switch_chat(channel)
    chatShowAnimator.start()
    chatShowAnimatorv.start()
}

//animate the chat in
function hide_chat() {
    chatout=false
    chatShowAnimator.stop()
    chatShowAnimatorv.stop()
    chatHideAnimator.start()
    chatHideAnimatorv.start()
    chat.innerHTML = ''
}

//show a list of favorites
function show_favorites(event)
{
    save_history()
    username = widget.preferenceForKey('username')
    if(!username) {
        box.innerHTML='You need to set your Justin.tv username to see your favorites'
        return
    }
    url = "http://api.justin.tv/api/user/favorites/"+username+".json?limit=20"
    text = get(url).responseText
    results = get_json(text)
    box.innerHTML=channel_table(results)
}

//handle the search box
function search_go(event)
{
    if (event.keyCode == 13) {
        search_results(searchfield.value)
    }
}

//query the search server and get results
function search_results(q)
{
    response = get('http://searchproxy.justin.tv:4142/?q='+q+'&encode-as=yaml')
    save_history()
    box.innerHTML = '<table>'
    logins = response.responseText.match(/login:(.*?),/g)
    if (logins) {
        results = []
        for (var i in logins) {
            login = /login: (.*),/.exec(logins[i])[1]
            channel = get_json(get('http://api.justin.tv/api/stream/list.json?channel='+login).responseText)
            if (channel.length > 0){
                results.push(channel[0].channel)
            }
        }
        box.innerHTML = channel_table(results)
    } else {
        box.innerHTML = 'No results found'
    }
}

//find the top broadcasts on JTV
function top_broadcasts(event)
{
    url = "http://api.justin.tv/api/stream/list.json?limit=15"
    text = get(url).responseText
    results = get_json(text)
    for(var i in results) {
        results[i] = results[i].channel
    }
    save_history()
    box.innerHTML = channel_table(results)
}

//Show a table of channel objects
function channel_table(results) {
    var newhtml = '<div style="height:100%;overflow-y:scroll">'
    newhtml += '<table>'
    for (var i in results) {
        newhtml += '<tr><td>'
        newhtml += '<a href="javascript:show_video(\''+results[i].login+'\')"><img width=150 height=113 src="'+results[i].screen_cap_url_medium+'"></a></td>'
        newhtml += '<td style="vertical-align:top; font-family:sans-serif; "><a href="javascript:show_video(\''+results[i].login+'\')">'+results[i].login+'</a>'
        attrs = ''
        newhtml += '<br>'+results[i].title
        newhtml += '<br>Category: '+results[i].category_title
        newhtml += '<br>Subcategory: '+results[i].subcategory_title
        newhtml += '</td></tr>'
    }
    newhtml += '</table>'
    newhtml += '</div>'
    return newhtml
}

//AJAX utility functions
//parse JSON
function get_json(text)
{
    x = eval('('+text+')')
    return x
}

//do an HTTP get and return the result
function get(url)
{
    request = new XMLHttpRequest()
    request.open("GET", url, false)
    request.send(null)
    return request
}

//handle the username box on the back
function usernamechange(event)
{
    widget.setPreferenceForKey(event.target.value, 'username')
}

//functions to handle history and the back button
function go_back(){
    if (historystack.length) {
        hist = historystack.pop()
        box.innerHTML = hist[0]
        cur_channel = hist[1]
        if(chatout && cur_channel) {
            switch_chat(cur_channel)
        }
    }
    
}

function save_history() {
    historystack.push([box.innerHTML,cur_channel])
}



//DASHCODE STUFF
//
// Function: showBack(event)
// Called when the info button is clicked to show the back of the widget
//
// event: onClick event from the info button
//
function showBack(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToBack");
    }

    front.style.display = "none";
    back.style.display = "block";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

//
// Function: showFront(event)
// Called when the done button is clicked from the back of the widget
//
// event: onClick event from the done button
//
function showFront(event)
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");

    if (window.widget) {
        widget.prepareForTransition("ToFront");
    }

    front.style.display="block";
    back.style.display="none";

    if (window.widget) {
        setTimeout('widget.performTransition();', 0);
    }
}

if (window.widget) {
    widget.onhide = hide;
    widget.onshow = show;
}