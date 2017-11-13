// ==UserScript==
// @name         Typeracer Easier Parties
// @namespace    com.github.stenlan.trparties
// @version      0.2
// @description  Typeracer easier party joining
// @author       stenlan
// @match        http://play.typeracer.com/*
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @grant        GM_xmlhttpRequest
// @connect      typeracer.com
// ==/UserScript==

var jQuerd = jQuery.noConflict(true);
var previouslyOnMain = false;
var previouslyInRoom = false;
var checkingMessages = false;
var invitingFriends = false;
var loadingInterval = null;
var loadingRotation = 0;

var zeInterval = setInterval(function(){
    if(jQuerd(".mainMenu").first().length !== 0){
        if(previouslyOnMain === false){
            addRefreshButton();
            checkMessages();
            previouslyOnMain = true;
        }
    }else{
        previouslyOnMain = false;
    }
    if(jQuerd(".urlTextbox.urlTextbox-readonly").val() !== undefined){
        if(previouslyInRoom === false){
            var roomUrl = jQuerd(".urlTextbox.urlTextbox-readonly").val();
            if(roomUrl.startsWith("http://play.typeracer.com/?rt=")){
                addInviteFriendsButton(jQuerd(".urlTextbox.urlTextbox-readonly").val().substr("http://play.typeracer.com/".length));
                previouslyInRoom = true;
            }
        }
    }else{
        previouslyInRoom = false;
    }
}, 200);

function checkMessages(){
    if(!checkingMessages){
        checkingMessages = true;
        var friendRefreshButton = jQuerd("#friendsRefreshButton");
        var friendRefreshText = jQuerd("#friendsRefreshText");
        var friendRefreshTd = jQuerd("#friendsRefreshTd");

        friendRefreshText.html("Refreshing...");
        friendRefreshButton.css("pointer-events", "none");
        friendRefreshText.css("pointer-events", "none");
        friendRefreshTd.css("pointer-events", "none");
        friendRefreshButton.css("transform", "rotate(0deg)");
        loadingInterval = setInterval(function(){
            friendRefreshButton.css("transform", "rotate(" + loadingRotation + "deg)");
            loadingRotation += 1.8;
        }, 5);
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://data.typeracer.com/pit/messages",
            onload: function(data){
                var newestMessage = jQuerd(jQuerd.parseHTML(data.responseText)).find(".unreadMessage").first().find(".messageBody").first().children().first().html();
                newestMessage = newestMessage === undefined ? "" : newestMessage.trim();
                handleMessageCheck(newestMessage);
                clearInterval(loadingInterval);
                friendRefreshButton.css("transform", "rotate(0deg)");
                friendRefreshText.html("Refresh friend rooms");
                friendRefreshButton.css("pointer-events", "auto");
                friendRefreshText.css("pointer-events", "auto");
                friendRefreshTd.css("pointer-events", "auto");
                loadingRotation = 0;
                checkingMessages = false;
                console.log("success");
            }
        });
    }
}

function createJoinFriendTr(joinUrl){
    if(jQuerd(".mainMenu").first().attr("joinfriendsbuttonadded") !== "true"){
        var mainPlayButton = jQuerd(jQuerd.parseHTML(jQuerd(".mainMenu").first().find("table tbody").first().children("tr").get(1).outerHTML));
        mainPlayButton.find("td.ImageButton").remove();
        mainPlayButton.find("img").first().css("background", "url(https://i.imgur.com/UBn1nOJ.png) no-repeat 0px 0px");
        mainPlayButton.find("img").first().click(function(){
            window.location.replace(joinUrl);
        });
        mainPlayButton.find("a").first().html("Join friends");
        mainPlayButton.find("a").first().attr("title", null);

        mainPlayButton.find("a").first().click(function(){
            window.location.replace(joinUrl);
        });
        mainPlayButton.find(".gwt-Label").html("A friend shared a track less than 5 minutes ago");
        jQuerd(".mainMenu").first().find("table tbody").first().children("tr:eq(1)").after(mainPlayButton);
        jQuerd(".mainMenu").first().attr("joinfriendsbuttonadded", "true");
    }else{
        jQuerd(".mainMenu").first().find("table tbody").first().children("tr:eq(2)").find("img").first().click(function(){
            window.location.replace(joinUrl);
        });
        jQuerd(".mainMenu").first().find("table tbody").first().children("tr:eq(2)").find("a").first().click(function(){
            window.location.replace(joinUrl);
        });
    }
}

function addRefreshButton(){
    if(jQuerd(".mainMenu").first().attr("refreshbuttonadded") !== "true"){
        var refreshTd = jQuerd(document.createElement("TD"));
        refreshTd.css("vertical-align", "top");
        refreshTd.css("margin-left", "20px");

        refreshTd.attr("align", "left");
        refreshTd.addClass("ImageButton");
        refreshTd.attr("id", "friendsRefreshTd");
        refreshTd.click(function(){
            checkMessages();
        });

        var refreshButton = jQuerd(document.createElement("IMG"));
        refreshButton.css("width", "32");
        refreshButton.css("height", "32");
        refreshButton.attr("src", "https://i.imgur.com/Okx1nQg.png");
        refreshButton.attr("id", "friendsRefreshButton");


        var refreshText = jQuerd(document.createElement("SPAN"));
        refreshText.html("Refresh friend rooms");
        refreshText.attr("id", "friendsRefreshText");
        refreshText.css("float","right");
        refreshText.css("margin-left","10px");
        refreshText.css("height","32px");
        refreshText.css("line-height","32px");

        refreshTd.append(refreshButton);
        refreshTd.append(refreshText);
        jQuerd(".mainMenu:eq(0) table:eq(0) tbody tr:eq(1) tbody tr:eq(0)").append(refreshTd);
        jQuerd(".mainMenu").first().attr("refreshbuttonadded", "true");
    }
}

function addInviteFriendsButton(roomUrl){
    if(jQuerd(".roomSection").first().attr("invitefriendsbuttonadded") !== "true"){
        var invFriendsButton = jQuerd(jQuerd.parseHTML(jQuerd(".roomSection table:eq(0) tbody:eq(0) tr:eq(1) tbody tr:eq(0)").children().get(1).outerHTML));
        invFriendsButton.find("img").first().attr("id", "invFriendsImg");
        invFriendsButton.find("img").first().click(function(){
            inviteFriends(roomUrl);
        });
        invFriendsButton.find("a").first().html("share with friends");
        invFriendsButton.find("a").first().attr("id", "invFriendsText");
        invFriendsButton.find("a").first().click(function(){
            inviteFriends(roomUrl);
        });
        jQuerd(".roomSection table:eq(0) tbody:eq(0) tr:eq(1) tbody tr:eq(0)").children().eq(0).after(invFriendsButton);
        jQuerd(".roomSection").first().attr("invitefriendsbuttonadded", "true");
    }else{
        jQuerd(".roomSection table:eq(0) tbody:eq(0) tr:eq(1) tbody tr:eq(0)").children().eq(1).find("a").first().html("share with friends");
        jQuerd(".roomSection table:eq(0) tbody:eq(0) tr:eq(1) tbody tr:eq(0)").children().eq(1).find("img").first().click(function(){
            inviteFriends(roomUrl);
        });
        jQuerd(".roomSection table:eq(0) tbody:eq(0) tr:eq(1) tbody tr:eq(0)").children().eq(1).find("a").first().click(function(){
            inviteFriends(roomUrl);
        });
    }
}

function inviteFriends(roomUrl){
    if(!invitingFriends){
        invitingFriends = true;
        var invFriendsText = jQuerd("#invFriendsText");
        var invFriendsImg = jQuerd("#invFriendsImg");

        invFriendsText.html("Inviting...");
        invFriendsImg.css("cursor", "default");
        invFriendsText.css("cursor", "default");
        invFriendsImg.css({'pointer-events': 'none'});
        invFriendsText.css({'pointer-events': 'none'});
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://data.typeracer.com/pit/friends",
            onload: function(data){
                var friendsList = [];
                jQuerd(jQuerd.parseHTML(data.responseText)).find(".friendsTable:eq(0) tbody:eq(0) tr[height]").each(function(index, element){
                    friendsList.push(jQuerd(element).find("td:eq(1) a").html());
                });

                friendsList.forEach(function(item, index){
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: "http://data.typeracer.com/pit/message_compose",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        data: "to=" + item + "&body=" + roomUrl + "+" + Date.now() + "&returnUrl=http%3A%2F%2Fdata.typeracer.com%2Fpit%2Fmessages",
                        onload: function(data2){
                            if(index === friendsList.length - 1){
                                invFriendsText.html("share with friends");
                                invFriendsImg.css("cursor", "pointer");
                                invFriendsText.css("cursor", "pointer");
                                invFriendsImg.css({'pointer-events': 'auto'});
                                invFriendsText.css({'pointer-events': 'auto'});
                                invitingFriends = false;
                                alert("Successfully invited all friends!");
                            }
                        }
                    });
                });
            }
        });
    }
}

function handleMessageCheck(message){
    if(message !== undefined){
        message = message.split(" ");
        timestamp = parseInt(message[1]);
        if(message[0].startsWith("?rt=") && !isNaN(timestamp)){
            jQuerd(".datarow tbody:eq(0) tr td:eq(2) img:eq(0)").css("background", "url(https://i.imgur.com/CLSgJUB.png) 0px 0px no-repeat");
            if((Date.now() - timestamp) / 1000 < 300){
                createJoinFriendTr("http://play.typeracer.com/" + message[0]);
            }
        }
    }
}
