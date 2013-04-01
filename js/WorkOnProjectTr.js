//Additional branches should be created by php
//In additionaldownbranch we can get rid of the level since we're grabbing more than one level now
var n=1;
var votes={};
setter=false;
recommendedChildren={};
pieceActivatedForMove=false;
backForwardButton=true;
isTemplate=false;
canceledPieces=new Array();
dblClickCheck=0;
$(document).ready(function(){
	autoSave=($("#autoSaveChecked").is(":checked") ? true:false);
	ProjectID=$("#ProjectID").val();
	var tree = $('#myTree');
	setPosVars();
	keytagsActivate();
	addUser(1);
	addUser(2);
	$(window).resize(function() {
		setPosVars();
	});
	$(window).scroll(function() {
		if (fixedPositionMenu) {
			var scrolltop = $(window).scrollTop();
			theTabHeight=($("#summaryPanel").css("display")=="none" ? "#branches":"#summaryPanel");
			if (((parseInt($(theTabHeight).height()))+100) > initialBottom && ($(theTabHeight).outerHeight(true)+100)>window.innerHeight && $(theTabHeight).is(":visible")) {
				var margintop = initialBottom - scrolltop - (parseInt($(theTabHeight).height()));
				if((-margintop)- (parseInt($(theTabHeight).height())) <0){
					$("#panelRight").css({"top":margintop+"px","height":parseInt($("#panelRight").height())+250+"px"});
				}
				else{
					$("#panelRight").css({"top":"0px","height":"100%"});		
				}
			}
			if(scrolltop==0){
				$("#panelRight").css({"top":"0px"});	
			}
		}
	});	
	$("#mainContent").on("contextmenu",".pieceDescriptions",function rightClick(e){		
		var trueFalseValues=$(this).parent("div").attr("onclick").substring(44,$(this).parent("div").attr("onclick").indexOf(",this.parentNode")).split(",");
		for(nn=0; nn<4; nn++){
			if(trueFalseValues[nn]=="false"){
				trueFalseValues[nn]=false;
			}
			else{
				trueFalseValues[nn]=true;
			}
		}
		selectPiece($(this).parent("div"),"firstChildLiLeftSelected",trueFalseValues[0],trueFalseValues[1],trueFalseValues[2],trueFalseValues[3],$(this).parent("div").parent("li").attr("id"),0); 
		rightClickMenu(e);
		return false;
	});
	$("#mainContent").on("contextmenu","#textInFirstLI",function(e){
		changeSummaryPanel($("#myTree").children("li:first").attr("id"));
		branchLevels="";
		$.getJSON("AjaxQueries.php?QueryNumber=21&MaxLevels=15&PieceID="+$("#myTree").children("li:first").attr("id")+($("#ProjectID").attr("data-private")==1 ? "&private=true&ProjectID="+document.getElementById("ProjectID").value:""),function(data){
			if(data.length!=0){
				for(yy=0; yy<data.length; yy++){
					for(index in data[yy]){
						branchLevels+="<div class='treeLocItem' onclick='upBranch("+index+")' id='secondLevel'><span style='opacity:0.75'>"+data[yy][index]+"</span></div>";
					}
				}
				$("body").append("<div id='timelineHoverOptions' class='blueGradient' style='padding:10px; top:"+e.pageY+"px; left:"+e.pageX+"px;'>"+branchLevels+"</div>");
			}
		});
		
		return false;
	});
	$("body").on("mouseleave","#editPieceOptionsMenu,#timelineHoverOptions",function(){
		menuClear=setTimeout('$("#editPieceOptionsMenu,#timelineHoverOptions").remove()',100);
	}).on("mouseover","#editPieceOptionsMenu,#timelineHoverOptions",function(){
		if(typeof menuClear!="undefined"){
			clearTimeout(menuClear);
		}
	});
	$("body").on("click",".contextMenuOption",function(){
		$("#editPieceOptionsMenu,#timelineHoverOptions").remove();
	});
	$('#newPiece').autocomplete({ source: function (req,add){
		var piece=$('#newPiece').val();
		if(typeof getPiecesOpen!="undefined"){
			if(getPiecesOpen.state()=="pending"){
				return;
			}
		}
		getPiecesOpen=$.getJSON("getPieces.php?q="+piece, function(data) {  
			//create array for response objects  
			var suggestions = [];  
			//process response  
			if(data!=null){
				$.each(data, function(i, val){
					suggestions.push(val);
				});
				add(suggestions);}
			});	
		},select:function(e,ui){
			var childSpot=($("#pointer_spot_holder").length>0 ? "pointer_spot_holder":"childrenHere");
			createChild(ui.item.id,ui.item.label,childSpot);	
			$.getJSON("getChildren.php?q="+ui.item.label+"&ParentID=0&ProjectID="+document.getElementById('ProjectID').value, function(data) {
				if(data!=null){
					recommendedChildren={};
					$.each(data, function(i, val){
						if($("#childrenHere>li").length>9){
							recommendedChildren[val.id]=val.label;	
						}
						else{
							createChild(val.id,val.label,"childrenHere"); 
						}
					});
				}
			});
			$('#newPiece').val("");
			$('#newPiece').autocomplete("close");
			return false;
		},delay:0,html:true,close:function(){
			getPiecesOpen.abort();
		}
		});
		$('#theFirstPiece').autocomplete({ source: function (req,add){
			var piece=$('#theFirstPiece').val();
			getThePieces=$.getJSON("getPieces.php?q="+piece, function(data) {  
				//create array for response objects  
				var suggestions = [];  
				//process response  
				if(data!=null){
					$.each(data, function(i, val){
						suggestions.push(val);
					});
					add(suggestions);}
				});	
			},select:function(e,ui)	{
				createFirstPiece(ui.item.label,ui.item.id); 
				$.getJSON("getChildren.php?q="+ui.item.label+"&ParentID=0&ProjectID="+document.getElementById('ProjectID').value, function(data) {
					if(data!=null){
						recommendedChildren={};
						$.each(data, function(i, val){
							if($("#childrenHere>li").length>9){
								recommendedChildren[val.id]=val.label;	
							}
							else{
								createChild(val.id,val.label,"childrenHere"); 
							}
						});
					}
				});
				return false;
			},delay:0,html:true,close:function(e,ui){
				getThePieces.abort();
			}
		});
		$("#pointerBox").on("click",function(){
			$("#newPieceEntry").append($("#newPiece").removeClass("newPieceOutOfConsole"));
			$(".pointer_spot").remove();
			$("#pointerSpot").hide();
			$("#pointerBox").after("<li id='pointer_spot_holder' class='pointer_spot'><div class='textHolder'><img src='images/Pointer_Right.png' height='16' width='14' /></div></li>");
			createTimeline();
			adjustTimelineHeight();
		});
		$("#myTree").on("mouseover",".pieceDescriptions",function() {
		$(".temp_spot").remove();
		if($(this).parent("div").is(".firstChildLiRight,.firstChildLiLeft")){
			if($(this).parent("div").parent("li").children("ol").children("li:first").length>0){
				if(!$(this).parent("div").parent("li").children("ol").children("li:first").hasClass("pointer_spot")){
					$(this).parent("div").parent("li").children("ol").children("li:first").before("<li id='temp_spot_holder' style='min-height:0px; height:0px;' class='temp_spot grandchildLi'></li>");
				}
			}
			else{
				$(this).parent("div").parent("li").children("ol").append("<li id='temp_spot_holder' class='grandchildLi temp_spot' style='min-height:0px; height:0px;'></li>");
				
			}
		}
		else{
			if(!$(this).parent("div").parent("li").next("li").hasClass("pointer_spot")){
				$(this).parent("div").parent().after("<li class='temp_spot grandchildLi' id='temp_spot_holder' style='min-height:0px; height:0px;'></li>");
			}
		}
		var pointerIndex=$(".temp_spot").parent("ol").parent("li").index();
		if(pointerIndex>1){
			createTimelineFromIndex(pointerIndex);
		}
		else{
			createTimeline();
		}
		if(document.getElementById("temp_spot_holder")!=null){
			$("body").append("<span id='tempSpotPointer' style='position:absolute; top:"+($("#temp_spot_holder").offset().top-8)+"px; left:"+($("#temp_spot_holder").offset().left<300 ? $("#temp_spot_holder").offset().left-8:$("#temp_spot_holder").offset().left)+"px'><img src='images/Pointer_Right.png' height='16' width='14'  />"+($("#temp_spot_holder").index()+1)+".</span>");
		}
    }).on("mouseout",function(){
		var pointerIndex=parseInt($(".temp_spot").parent("ol").parent("li").index());
		$(".temp_spot,#tempSpotPointer").remove();
		if(pointerIndex>1){
			createTimelineFromIndex(pointerIndex);
		}
		else{
			if(pointerIndex!=-1){
				createTimeline();
			}
		}
	});
	$("#myTree").on("click",".pieceDescriptions",function() {
		$("#newPieceEntry").append($("#newPiece"));
		$(".temp_spot,.pointer_spot,#tempSpotPointer").remove();
		$("#pointerSpot").hide();
		if($(this).parent("div").is(".firstChildLiRight,.firstChildLiLeft")){
			if($(this).parent("div").parent("li").children("ol").children("li:first").length>0){
				$(this).parent("div").parent("li").children("ol").children("li:first").before("<li id='pointer_spot_holder' class='pointer_spot grandchildLi'><div class='textHolder'><img src='images/Pointer_Right.png' height='16' width='14' /></div></li>");
				
			}
			else{
				$(this).parent("div").parent("li").children("ol").append("<li id='pointer_spot_holder' class='pointer_spot grandchildLi'><div class='textHolder'><img src='images/Pointer_Right.png' height='16' width='14' /></div></li>");
			}
		}
		else{
        	$(this).parent("div").parent().after("<li class='pointer_spot grandchildLi'  id='pointer_spot_holder'><div class='textHolder'><img src='images/Pointer_Right.png' height='16' width='14' /></div></li>");
		}
		$("#pointer_spot_holder>.textHolder").append($("#newPiece"));
		$("#newPiece").focus();
		createTimeline();
		adjustTimelineHeight();
    });
    $("#mainContent").on("mousemove",'.timeline_container',function(e){
		var pag= e.pageY -$("#myTree").children("li").children("ol").position().top-200;
		$('.plus').css({"top":pag +"px", "background":"url('images/Pointer_Spine.png') no-repeat","margin-left":"1px"});
	}).mouseout(function()	{
		$('.plus').css({"background":""});});
	//Timeline navigator on click action 
	$("#mainContent").on("click",".timeline_container",function(e){
		previousElement=false;
		$("#newPieceEntry").append($("#newPiece"));
		$(".temp_spot,.pointer_spot").remove();
		if($("#myTree").children("li").children("ol").children("li").length==0){
			$("#myTree").children("li").children("ol").append("<li id='pointer_spot_holder' class='pointer_spot'><div class='textHolder'></div></li>");
			if($("#pointerSpot").css("display")=="none"){
				$("#pointerSpot").css({'top':$(".pointer_spot").position().top+'px'});
			}
			else{
				$("#pointerSpot").animate({"top":$(".pointer_spot").position().top+"px"});
			}
			$("#pointer_spot_holder>.textHolder").append($("#newPiece"));
			$("#newPiece").focus();
			createTimeline();
			adjustTimelineHeight();
			($(".pointer_spot").position().left<300 ? $("#pointerSpot").children("#pointerSpotImage").attr("src","images/Finger_Left.png").css("margin-left","-2px"):$("#pointerSpot").children("#pointerSpotImage").attr("src","images/Finger_Right.png").css("margin-left","12px"));
			$("#pointerSpot").show();
			return false;
		}
		$("#myTree").children("li").children("ol").children("li").each(function(index, element) {
			if($(element).offset().top+(index==0 ? 13:(parseInt($(element).css("padding-top").substring(0,$(element).css("padding-top").indexOf("px")))+13))>(e.pageY)){
				return false;
			}
			previousElement=element;
		});
		if(previousElement==false){
			$("#myTree").children("li").children("ol").children("li:first").before("<li id='pointer_spot_holder' class='pointer_spot'><div class='textHolder '></div></li>");
		}
		else{	
			$(previousElement).after("<li id='pointer_spot_holder' class='pointer_spot'><div class='textHolder'></div></li>");
			previousElement=false;
		}
		$("#pointer_spot_holder>.textHolder").append($("#newPiece"));
		createTimeline();
		adjustTimelineHeight();
		if($("#pointerSpot").css("display")=="none"){
			$("#pointerSpot").css({'top':$(".pointer_spot").position().top+($(".pointer_spot").index()==1 ? 50:($(".pointer_spot").index()==0 ? 0:parseInt($(".pointer_spot").css("padding-top"))))+'px'});
		}
		else{
			$("#pointerSpot").animate({"top":$(".pointer_spot").position().top+($(".pointer_spot").index()==1 ? 50:($(".pointer_spot").index()==0 ? 0:parseInt($(".pointer_spot").css("padding-top"))))+"px"});
		}
		($(".pointer_spot").position().left<300 ? $("#pointerSpot").children("#pointerSpotImage").attr("src","images/Finger_Left.png").css("margin-left","-2px"):$("#pointerSpot").children("#pointerSpotImage").attr("src","images/Finger_Right.png").css("margin-left","12px"));
		$("#newPiece").focus();
		$("#pointerSpot").show();			
	});
	showUpToGrandChildren();
	createTimeline();
	adjustTimelineHeight();
});
function showUpToGrandChildren(){
	$("#myTree").children("li").children("ol").children("li").each(function(index1, element1) {
		$(element1).children("ol").show().children("li").show();
		$(element1).children("ol").children("li").children("ol").hide();
	});
}
function keytagsActivate(){
	$("#projectKeywords").on("click",".removeTag",function(){
		var keywordToRemove=$(this).prev().text();
		$(this).parent("span").remove();
		$.get("AjaxQueries.php?QueryNumber=25&Keyword="+keywordToRemove+"&ProjectID="+ProjectID,function(data){
		});
	});
	$(".addKeywordInput").click(function(){
		if($(this).val()=="Add up to 10 keywords"){
			$(this).val("");	
		}
	});
	$('.addKeywordInput').autocomplete({ source: function (req,add){
		var word=$('.addKeywordInput').val();
		$.getJSON("getKeywords.php?q="+word, function(data) {  
			//create array for response objects  
			var suggestions = [];  
			//process response  
			if(data!=null){
				$.each(data, function(i, val){
					suggestions.push(val.name);
				});
				add(suggestions);}
			});	
		},select:function(e,ui)	{
			addKeyword(ui.item.label);
			return false;
		},delay:0,html:true
	});
}
function addKeyword(label){
	$('.addKeywordInput').autocomplete("close");
	if($(".keyTag").length>9){
		return;
	}
	labelIsUnique=true;
	label=$.trim(label);
	$(".keyTag").each(function(index, element) {
        if($.trim($(element).children(":first").text()).toLowerCase()==label.toLowerCase()){
			labelIsUnique=false;
		}
    });
	if(labelIsUnique){
		$(".addKeywordInput").val("").before("<span class='keyTag'><span>"+label+"</span><span class='removeTag'>x</span></span>");
		$.get("AjaxQueries.php?QueryNumber=24&Keyword="+encodeURIComponent(label)+"&ProjectID="+ProjectID,function(data){
		});
	}
}
function getPossibleBranches(ideaID,parentList,callDownBranch,hoverBubble){
	$("#branches").empty();
	if(hoverBubble){
		$("body").append($("#branches").removeClass("sbbRight sbbLeft"));
		$("#branches").addClass("suggestedBranchesBubble "+($("#"+parentList).offset().left>$("body").width()/2 ? "sbbRight":"sbbLeft"));
		$("#branches").css({"display":"inline-block","left":($("#"+parentList).offset().left>$("body").width()/2 ? "27%":"42%"),"top":($("#"+parentList).offset().top-35)+"px"});
	}
	var p="First branch:";
	if(!ideaID){
		if($("#myTree >li:first").attr("id")!=parentList){
			var ideaDesc=$("#"+parentList).children(".textHolder").children(".pieceDescriptions").text();	
		}
		else{
			var ideaDesc=$("#textInFirstLI").text();
		}
	}
	var jsonString="AjaxQueries.php?ParentPieceID="+parentList+"&QueryNumber=16&"+(ideaID ? "IdeaID="+ideaID:"IdeaDescription="+encodeURIComponent(ideaDesc));
	$("#branches").append("<div id='removeMe' class='recommendContent'>Loading recommended branches and pieces<div><img src='images/ajax-loader.gif' height='100' width='100' class='loader'  /></div></div>");
	$.getJSON(jsonString,function(data){
		if(data!=null){
			var optionsString="<div id='aSlider'><div style='margin-top:10px; height:180px; margin-bottom:10px;'><div id='sliderHandle'></div></div></div><div id='wrapBranches'><div id='innerBranches'><div style='margin-bottom:10px;'>Suggestions for: <div class='suggestionsFor'>"+ideaDesc+"</div></div>";  
			aString=document.createElement("ol");
			$.each(data,function(index, element) {
				index=$.parseJSON(index);
				var theList=$(document.createElement("ol")).append(tree(index,$(document.createElement("ol")).addClass("importList")));
				function tree(data, theList) {
					$.each(data, function(description, children) {
						theList.append("<li>"+description+"<ol class='importList'></ol></li>");
						children ? tree(children, $(theList).find("ol:last")) : 0;
					});
					return theList;
				}
				optionsString+="<tr><th class='searchResultsHeader'><div class='plusSign' onclick='createBranch("+element+","+parentList+","+(callDownBranch ? 1:0)+")'>+</div>"+$(theList).html()+" </th></tr>";				
			});
			optionsString+="</table></div></div></div>";
			document.getElementById("branches").innerHTML=optionsString;
			customScrolling("branches","innerBranches");
			$("#wrapBranches").resizable({
				alsoResize:"#branches",
				minHeight:220,
				minWidth:$("#wrapBranches").width()
			});
			if(!hoverBubble){
				$("#suggestedBranches").css({"background-color":"#0EAFFF"});
			}
		}
		else{
			$("#branches").append("<div class='recommendContent'>Sorry, no recommendations were found :(</div>");	
			setTimeout('$("#clipboardPanel").after($("#branches").removeAttr("class").attr("style","").hide());',1000);
		}
		$("#removeMe").remove();	
	});
}
function customScrolling(theContainer,innerContainer){
	$("#sliderHandle").draggable({scroll:false,axis:"y",containment:"parent",drag:function(e,u){ 
		$("#"+innerContainer).css("margin-top",(-($("#"+innerContainer).height()/172)*u.position.top)+"px");}
	});
	$("#"+theContainer).on("mousedown","#aSlider",function(e){
		if(typeof timeoutId!="undefined"){
			clearInterval(timeoutId);
		}
		if (!e.offsetY) {
			offY = e.pageY - $(e.target).offset().top;
		}
		else{
			offY=e.offsetY;
		}
		timeoutId=setInterval("clickScroll("+offY+",'"+innerContainer+"')",30);
	});
	$(document).on("mouseup",function(e){
		if(typeof timeoutId!="undefined"){
			clearInterval(timeoutId);
		}
		$("#sliderHandle").stop(true);
		if(theContainer=="branches"){
			var offsetBranch=$("#branches").offset();
			var offsetBranchR=offsetBranch.left+$("#branches").outerWidth();
			var offsetBranchB=offsetBranch.top+$("#branches").outerHeight();
			if(e.pageY>offsetBranchB || offsetBranch.left>e.pageX || offsetBranchR<e.pageX || e.pageY<offsetBranch.top){
				$("#clipboardPanel").after($("#branches").removeAttr("class").attr("style","").hide());
			}			
		}
	});
}
function clickScroll(theOffset,innerContainer){
	$("#sliderHandle").stop(true);
	var sliderPosition=$("#sliderHandle").position().top-38;
	if(theOffset>(sliderPosition)){
		if(sliderPosition<172 && sliderPosition!=theOffset){
			$("#sliderHandle").css("top","+=1");
			$("#"+innerContainer).css("margin-top",(-($("#"+innerContainer).height()/172)*($("#sliderHandle").position().top-37))+"px");
		}
	}
	else{
		if(sliderPosition>0 && sliderPosition!=theOffset){
			$("#sliderHandle").css("top","-=1");
			$("#"+innerContainer).css("margin-top",(-($("#"+innerContainer).height()/172)*($("#sliderHandle").position().top-38))+"px");
		}
	}					
}
	
function whatHappened(){
	$("#whatHappened").slideUp(400,function(){
		$("#whatHappened").remove();
		$.get("AjaxQueries.php?QueryNumber=31");
	}); 
}
function createBranch(pieceID,parentList,callDownBranch){
	branchIsCreated=$.get("AjaxQueries.php?QueryNumber=30",function(data){
		if(data==""){
			$("body").append("<div id='whatHappened' style='display:none;'><div id='closeWhatHappened' onclick='whatHappened()'>X</div>You just reused a branch from another project. This is a useful feature that allows you to build big projects quickly. Feel free to save the pieces that are useful and get rid of anything you don't need. </div>");
			$("#whatHappened").slideDown(400);
		}
	});
	$("#branches").empty();
	clipboard();
	$("#suggestedBranches").css("background-color","#fff");
	$.modal.close();
	w=1;	
	firstLevelIdeas=new Array();
	$("#parentList"+parentList).children("li").each(function(index, element) {
			firstLevelIdeas.push($(element).children("div:first").children(".pieceDescriptions").text());
	});
	$.getJSON("GetTreeBranch.php?PieceID="+pieceID,function(data){
		function recurse(data, treeToAppend) {
			if(data!=null){
				$.each(data,function(index1,element){
					$.each(element, function(index, piece){
						if(piece!=null){
							$.each(piece, function(description, children) {
								if($.inArray(description,firstLevelIdeas)==-1 && $.inArray(description,canceledPieces)==-1){
									if(w!=1){
										$(treeToAppend).append($(document.createElement("li")).attr("id","pieceIDBranch"+w).addClass("treeItem").append($(document.createElement("div")).addClass("textHolder").append($(document.createElement("span")).addClass("icons").append("<img class='alignBottom' src='images/Save_Rollover.png' onMouseOver='this.src=\"images/Save.png\"; tagPiece(this,\"Save this piece\");' onMouseOut='this.src=\"images/Save_Rollover.png\"; tagRemove();' onclick='saveAction(this)' id='thingy"+w+"' value='Save' style='display:none;' /><img width='15' height='13' class='alignBottom' onclick='cancelAction(this)' src='images/Cancel.png' id='cancel"+w+"' onMouseOver='this.src=\"images/Cancel_Rollover.png\"' onMouseOut='this.src=\"images/Cancel.png\"' />").after($(document.createElement("div")).addClass("pieceDescriptions").text(description))).after($(document.createElement("ol")).attr("id","parentList"+w))));
									}
									w++;
									if(children){
										recurse(children, (w==2 ? treeToAppend:$("#parentList"+(w-1))));
									}	
								}
							});
						}
					});
				});
			}
		}
		
		recurse(data,$("#parentList"+parentList));
		delete(w);
		$("#parentList"+parentList).children("li").children(".textHolder").children(".icons").children().show();
		if(callDownBranch && $("#firstLI").parent("li").attr("id")!=parentList){
			downBranch("branchDown"+parentList);
		}
		else{
			showUpToGrandChildren();
			createTimeline();
			adjustTimelineHeight();
		}
	});	
}
function saveAction(clickedButton){
	tagRemove();
	var olderSib="NULL";
	var clickedButtonParentLi=$(clickedButton).parent("span").parent("div").parent("li");
	var parent=$(clickedButtonParentLi).parent("ol").parent("li").attr('id');
	var pieceDiv=$(clickedButton).parent("span").parent("div");
	var pieceSpan=$(clickedButton).parent("span");
	var n=1;
	var index=$(clickedButtonParentLi).index();
	if(index!=0){
		while($(clickedButtonParentLi).siblings("li").get(index-n).getAttribute("id").indexOf("pointer")>-1 || $(clickedButtonParentLi).siblings("li").get(index-n).getAttribute("id").indexOf("piece")>-1){
			n++;
			if((index-n)==-1){
				break;
			}
		}
	}
	if((index-n)!=-1){
		olderSib=$(clickedButtonParentLi).siblings("li").get(index-n).getAttribute("id");
	}
	var desc=encodeURIComponent($(clickedButton).parent("span").parent('.textHolder').text());
	$(clickedButton).siblings("img").remove();
	//xmlhttp=new XMLHttpRequest();
	if(typeof pieceCreated!="undefined"){
		if(pieceCreated.state()=="pending"){
			setTimeout(function(){
				saveAction(clickedButton);
			},250);
		}
		else{
			theSave(clickedButtonParentLi,parent,pieceDiv,pieceSpan,desc,olderSib,clickedButton);
		}
	}
	else{
		theSave(clickedButtonParentLi,parent,pieceDiv,pieceSpan,desc,olderSib,clickedButton);
	}	
//xmlhttp.open("GET",,true);
	//xmlhttp.send();
}
function theSave(clickedButtonParentLi,parent,pieceDiv,pieceSpan,desc,olderSib,clickedButton){
	pieceCreated=$.post("createPieceFunction.php","parent="+parent+"&project="+document.getElementById('ProjectID').value+"&text="+desc+"&olderSibling="+olderSib, function(data) {
		fullNodeIndex = data;
		$(clickedButton).remove();
		if (isNaN(parseInt(fullNodeIndex))|| fullNodeIndex==0) {
			//console.log(fullNodeIndex);
			alert("That idea already exists in this level or was deleted by the project owner.");
			$(pieceDiv).parent("li").remove();
			createTimeline();
		} 
		else {
			addedPieces.push(fullNodeIndex);
			//Remove buttons from ordering list
			$("[name="+$(clickedButtonParentLi).attr("id")+"]").attr("name",parseInt(fullNodeIndex)).children(".textHolder").children(".icons").empty();
			var parentLiId=$(clickedButtonParentLi).attr("id");
			$(clickedButtonParentLi).attr("id",parseInt(fullNodeIndex)).attr("data-pm",1).attr("data-tr",0);
			$.get("GetBidStatus.php?PieceID="+fullNodeIndex+($("#ProjectID").attr("data-private")==1 ? "Private=1":""),function(data){
				var bidRegistered=(data==1 ? 1:0);
				$("#"+fullNodeIndex).attr("data-bid",bidRegistered);	
			});
			$(pieceDiv).siblings("ol").attr("id","parentList"+parseInt(fullNodeIndex));
			$(pieceDiv).attr({"ondblclick":"downBranch('branchDown"+fullNodeIndex+"')","onclick":"selectPiece(this,'firstChildLiLeftSelected',false,false,false,false,this.parentNode.id)"});
			$(pieceDiv).siblings("ol").children("li").children(".textHolder").children(".icons").children("img").show();
			if(parseInt(ProjectOwner) || $("#ProjectID").attr("data-private")==1){
				$(pieceSpan).siblings(".pieceDescriptions").prepend("<input onclick='clickCheckbox(this)' onmouseover='tagPiece(this,\"Mark completed\")' onmouseout='tagRemove()' class='alignBottom' type='checkbox' id='c"+fullNodeIndex+"' />");	
			}		
			//Only call on autocompleted pieces
			if(parentLiId.substr(7,2)!="Br"){
				if(parentLiId.substr(7,4)=="Text"){
					getPossibleBranches(0,fullNodeIndex,0,0);	
				}
				else{
					getPossibleBranches(($("#ProjectID").attr("data-private")==1 ? 0:parentLiId.substr(7)),fullNodeIndex,0,0);
				}
			}
			if($("#ProjectID").attr("data-private")!=1){
				streamIdea($("li#"+fullNodeIndex).children("div").children(".pieceDescriptions").text());
			}
		}
	});	
}
function cancelAction(clickedButton){
	var parentLI=$(clickedButton).parent("span").parent("div").parent("li");
	canceledPieces.push($(clickedButton).parent("span").siblings(".pieceDescriptions").text());
	if($(parentLI).children("ol").find(".pointer_spot").length>0){
		$("#newPieceEntry").append($("#newPiece").removeClass("newPieceOutOfConsole"));
	}
	if(typeof $(parentLI).attr("id")=="undefined"){	
		$("li#"+$(parentLI).attr("name")).remove();
	}
	else{
		$("[name='"+$(parentLI).attr("id")+"']").remove();
	}	
	$(parentLI).remove();
	if($("#pointerSpot:not(:hidden)").length>0){
		$("#pointerSpot").animate({"top":$(".pointer_spot").position().top+($(".pointer_spot").index()==1 ? 50:($(".pointer_spot").index()==0 ? 0:parseInt($(".pointer_spot").css("padding-top"))))+"px"});
		($(".pointer_spot").position().left<300 ? $("#pointerSpot").children("#pointerSpotImage").attr("src","images/Finger_Left.png").css("margin-left","-2px"):$("#pointerSpot").children("#pointerSpotImage").attr("src","images/Finger_Right.png").css("margin-left","12px"));
	}
	createTimeline();
	checkSpaceForChildren();
}
function createFirstPiece(label,id){
	$('#theFirstPiece').autocomplete("close");
	$("#textInFirstLI").append(label+"<img class='alignBottom' src='images/Save_Rollover.png' onMouseOver='this.src=\"images/Save.png\"; tagPiece(this,\"Save this piece\");' onMouseOut='this.src=\"images/Save_Rollover.png\"; tagRemove();' onclick='saveFirst(0)' id='theFirstToSave' /><img width='15' height='13' class='alignBottom' src='images/Cancel.png' onClick='cancelFirst(this)' id='cancelFirstPiece' onMouseOver='this.src=\"images/Cancel_Rollover.png\"' onMouseOut='this.src=\"images/Cancel.png\"' />");	
	$('#theFirstPiece').hide();
	$("#helpfulTip").remove();
	setTimeout(function(){
		$("#theFirstToSave").mouseover();
	},50);
	if(id){
		$("#textInFirstLI").attr("name",id);
	}
}
function cancelFirst(thePiece){
	tagRemove();
	var autocompleteFirstPiece=$("#theFirstPiece").detach();
	$("#textInFirstLI").text("").append($(autocompleteFirstPiece).show());
}
function saveFirst(template){
	oldPieceID=$("#myTree").children("li:first").attr("id");
	$("body").append("<div id='damnDialog' title='Make this project a private project?'>Clicking yes means others can't see, contribute to, or re-use parts of your project unless you specifically allow them to.</div>");
	$("#damnDialog").dialog({modal:true,
		buttons : {
			"No" : function() {
				savesFirstPiece(0,template);
				$(this).dialog("close");
			},			
			"Yes":function(){
				savesFirstPiece(1,template);
				$(this).dialog("close");
			}
		}
	});
}
function savesFirstPiece(r,template){
	$("#textInFirstLI").children("span").remove();//fix for new jquery helper
	$.get("CreateOrEditProject.php?ProjectHeadline="+encodeURIComponent($("#theFirstPiece").val())+(r ? "&private=true":""),function(data){
		var IdeaID=$("#textInFirstLI").attr("name");
		var PieceID=data.substr(0,data.indexOf(","));
		var ProjectID=data.substr(data.indexOf(",")+1);
		$("#textInFirstLI").children("img").remove();		
		$("#pointerSpot").before('<div class="timeline_container"><div class="timeline"><div class="plus"></div></div></div>');
		$("#myTree").children("li:first").attr("id",PieceID);
		$("#textInFirstLI").attr({"onclick":"selectPiece(this,'textInFirstLISelected',false,false,false,false,this.parentNode.parentNode.id)"});
		$("#myTree").children("li:first").children("ol").attr("id","parentList"+PieceID);
		var oldProjectID=$("#ProjectID").attr("value");
		$("#ProjectID").attr("value",ProjectID).attr("data-private",r);
		backForwardButton=false;
		window.location.hash=window.location.hash+"/ProjectID="+ProjectID;
		$("#topLevelPiece").attr("onclick","upBranch("+PieceID+")").children("span").text($("#theFirstPiece").val());
		adjustTimelineHeight();	
		//Opens the project
		if(template){
			createBranch(oldPieceID,PieceID);
			delete(oldPieceID);
			isTemplate=oldProjectID;
		}
		else{
			getPossibleBranches((typeof IdeaID!="undefined" ? IdeaID:0),PieceID,0,0);
		}
		$(".pieceColor").empty().append($("#theFirstPiece").val());
		if(!template){
			selectPiece(document.getElementById("textInFirstLI"),"textInFirstLISelected",false,false,false,false,document.getElementById("textInFirstLI").parentNode.parentNode.id);
		}
		todaysDate=new Date();		
		$("#projCreationDate").html("Project created: "+(todaysDate.getMonth()+1)+"/"+todaysDate.getDate()+"/"+todaysDate.getFullYear());
		if(!r){
			$("#addMoney,.addKeywordInput").show();
			keytagsActivate();
			streamProject();
		}
		else{
			$("#projCreationDate").after("<div class='projInfo' id='addPrivateUser'>Add users to project: <input type='text' id='privateUsername' /></div>");
			$("#numUsers,#prizeAmount,#projectKeywords,#addMoney,#pieceGallBar,#pieceGalText,#pieceGallery").remove();
			addUser(1);
		}
	});	
}
function saveProjectDesc(){
	$("#tldr").remove();
	var descLength=$("#ideaInfo").val().length;
	//Should add in a counter
	if(descLength>1000){
		$("#saveDesc").after("<br><span id='tldr' style='color:red;'>Project descriptions are limited to 1000 characters</span>");
		return;
	}
	if(descLength<5){
		$("#saveDesc").after("<br><span id='tldr' style='color:red;'>Minimum description length of 5 characters not met</span>");
		return;
	}
	if(document.getElementById("ProjectID").value!=-1){
		//Should add in a waiting gif
		$.get("CreateOrEditProject.php?ProjectID="+document.getElementById("ProjectID").value+"&ProjectDescription="+$("#ideaInfo").val(),function(data){
			var projDesc=$("#ideaInfo").val();
			$("#saveDesc").before("<br>"+projDesc);
			$("#ideaInfo").remove();
			$("#saveDesc").attr({"id":"editDesc","value":"Edit","onclick":"editProjectDesc()"});
		});
	}
	else{
		var r=alert("You need to create the project headline before you can add a project description.");
		$("#firstLI").effect("highlight", {color:"#FFFC7F"}, 3000);
	}
}
function editProjectDesc(){
	var currentDesc=$("#projDescription").contents().filter(function(index) {
		if(index==5){
        	return this.nodeType==3;
		}
    });
	var projDescHead=$(".summarizePanelsText:first");
	$("#projDescription").empty().append($(projDescHead).after("<textarea style='vertical-align:bottom;' name='ideaInfo' cols='60' rows='3' id='ideaInfo'>"+$(currentDesc).text()+"</textarea><input type='button' value='Save' id='saveDesc' onclick='saveProjectDesc()' />"));
}
function addPictures(){
	if(document.getElementById("ProjectID").value!=-1){
		$("<div><img src='images/X_Button.png' onclick='closePictureModal()' class='simple-modal-close' /><div id='addPicturesModal'><h3 style='margin-bottom:10px;'>Add pictures</h3><iframe src='UploadPicsForm.php?ProjectID="+document.getElementById("ProjectID").value+"' frameborder='0' height='410px' width='400px'></iframe></div></div>").modal();	
	}
	else{
		var r=alert("You need to create the project headline before you can add pictures.");
		$("#firstLI").effect("highlight", {color:"#FFFC7F"}, 3000);
	}
}
function closePictureModal(){
	$.get("AjaxQueries.php?QueryNumber=19&ProjectID="+document.getElementById("ProjectID").value,function(data){
		if(data!=null){
			$("#projectImage0").children("a").children("img").attr({"src":data});
		}
	});
	$.modal.close();
}
function createChild(id,label,childSpot){
	var childExists=false;
	if(childSpot=="childrenHere"){
		$('#childrenHere').children("li").each(function(index, element) {
			if($(element).children(".textHolder").children(".pieceDescriptions").text()==label)
			{
				childExists=true;
				return false;
			}
		});
	}
	if(!childExists)
	{
		$(".pointer_spot").siblings("li").each(function(index, element) {
            if($(element).children(".textHolder").children(".pieceDescriptions").text()==label){
				childSpot="childrenHere"
				return false;
			}
        });
		if($(".pointer_spot").parent("ol").parent("li").children(".textHolder").children(".pieceDescriptions").text()==label || $(".pointer_spot").parent().attr("id")=="treasureChest"){
			//this allows duplicate pieces in console
			childSpot="childrenHere";
		}
		document.getElementById(childSpot).insertAdjacentHTML((childSpot=="childrenHere")? 'beforeEnd':'beforeBegin',"<li class='"+((childSpot=="childrenHere")? "":"treeItem") +"' id='pieceID"+id+"'><div class='textHolder'><span class='icons'><img class='alignBottom' src='images/Save_Rollover.png' onMouseOver='this.src=\"images/Save.png\"; tagPiece(this,\"Save this piece\");' onMouseOut='this.src=\"images/Save_Rollover.png\"; tagRemove();' id='thingy"+n+"' style='display:none;' /><img width='15' height='13' class='alignBottom' onclick='cancelAction(this)' src='images/Cancel.png' id='cancel"+n+"' onMouseOver='this.src=\"images/Cancel_Rollover.png\"' onMouseOut='this.src=\"images/Cancel.png\"' /></span><div class='pieceDescriptions'>"+label+"</div></div><ol id='parentList"+id+"'></ol></li>");
		$("#thingy"+n).click(function(){
			saveAction(this);
		});
		n++;
		if(childSpot=="pointer_spot_holder"){
			if($("#pointer_spot_holder").parent("ol").parent("li").attr("id").indexOf("piece")<0){
				$("#pieceID"+id).children(".textHolder").children(".icons").children().show();
			}
		}
		if(childSpot!="childrenHere"){
			createTimeline();
			adjustTimelineHeight();
			if(autoSave){
				saveAction($("#thingy"+(n-1)));	
			}
		}
		if($("#pointerSpot:not(:hidden)").length>0){
			$("#pointerSpot").animate({"top":$(".pointer_spot").position().top+($(".pointer_spot").index()==1 ? 50:($(".pointer_spot").index()==0 ? 0:parseInt($(".pointer_spot").css("padding-top"))))+"px"});
			($(".pointer_spot").position().left<300 ? $("#pointerSpot").children("#pointerSpotImage").attr("src","images/Finger_Left.png").css("margin-left","-2px"):$("#pointerSpot").children("#pointerSpotImage").attr("src","images/Finger_Right.png").css("margin-left","12px"));
		}
	}
}
function insertPiece(pieceToMove){
	if($(".pointer_spot").length>0){
		if($(".pointer_spot").parentsUntil("#"+$(pieceToMove).attr("id")).length==1){
			return;
		}
		var parentSameAsChild=false;
		var childText=$(pieceToMove).children(".textHolder").children(".pieceDescriptions").text();
		$(".pointer_spot").siblings("li").each(function(index, element) {
            if($(element).children(".textHolder").children(".pieceDescriptions").text()==childText && $(element).attr("id")!=$(pieceToMove).attr("id")){//Need to check why I have the && in the previous line
				parentSameAsChild=true;
				return false;
			}
        });
		if($(".pointer_spot").parent("ol").parent("li").children(".textHolder").children(".pieceDescriptions").text()==childText){
			parentSameAsChild=true;
		}
		if(parentSameAsChild){
			return;
		}
		$(pieceToMove).children(".textHolder").attr("ondblclick","downBranch('branchDown"+$(pieceToMove).attr("id")+"')");
		$(".halfOpacity").remove();
		//These were after the piece got put in 
		$(pieceToMove).removeClass("left right").children(".textHolder").removeClass("firstChildLiRight firstChildLiLeft");
		$(pieceToMove).children("div").children(".icons").children("img").show();	
		if($("#pointer_spot_holder").siblings("#pointerBox").length==0){
			$(pieceToMove).children(".textHolder").children(".icons").children().show();
			if($("#pointer_spot_holder").parent("ol").parent("li").attr("id").indexOf("piece")==0){
				$(pieceToMove).children(".textHolder").children(".icons").children("img:first").hide();
			}
		}
		else{
			$(pieceToMove).children("div").children(".icons").children(":not(img:last)").hide();	
		}
		//end moved text
		$(pieceToMove).animate({"top":($(".pointer_spot").offset().top)+"px","left":($(".pointer_spot").offset().left+20)+"px"},500,function(){
        	pieceActivatedForMove=false;
			document.getElementById("movePiece").innerHTML="Move this piece";
			$(".pointer_spot").before($(pieceToMove).css({"top":"","left":"","position":"relative"}));
			if($(".pointer_spot").parent("ol").parent("li").is(".left,.right")){
				 $(pieceToMove).css({"padding-top":"0px"});
			}
			createTimeline();
			$("#pointerSpot").animate({"top":$(".pointer_spot").position().top+($(".pointer_spot").index()==1 ? 50:($(".pointer_spot").index()==0 ? 0:parseInt($(".pointer_spot").css("padding-top"))))+"px"});
			($(".pointer_spot").position().left<300 ? $("#pointerSpot").children("#pointerSpotImage").attr("src","images/Finger_Left.png").css("margin-left","-2px"):$("#pointerSpot").children("#pointerSpotImage").attr("src","images/Finger_Right.png").css("margin-left","12px"));
			if($(pieceToMove).children("div").children(".icons").children("img").length==0){
				var parentID=$(pieceToMove).parent("ol").parent("li").attr("id"); 
				var olderSiblingID="NULL";
				var n=1;
				var index=$(pieceToMove).index();
				if(index!=0){
					while($(pieceToMove).siblings("li").get(index-n).getAttribute("id").indexOf("pointer")>-1 || $(pieceToMove).siblings("li").get(index-n).getAttribute("id").indexOf("piece")>-1){
							n++;
						if((index-n)==-1){
							break;
						}
					}
				}
				if((index-n)!=-1){
					olderSiblingID=$(pieceToMove).siblings("li").get(index-n).getAttribute("id");
				}
				//send new PCRS
				if($(pieceToMove).parent("#treasureChest").length==0 && $(pieceToMove).parent("#childrenHere").length==0){
					sendNewPCRSc(parentID,olderSiblingID,$(pieceToMove).attr("id"));
				}
			}
            showUpToGrandChildren();
	        createTimeline();
	        checkSpaceForChildren();
      });
	}
	else{
		alert("You need to set the pointer to where these pieces will go.");
	}
}
function checkSpaceForChildren(){
	for(var key in recommendedChildren){
		if($("#childrenHere>li").length<10){
			createChild(key,recommendedChildren[key],"childrenHere");
			delete(recommendedChildren[key]);	
		}
		else{
			break;
		}
	}
}
function selectIdea(idea){	
	tagRemove();
	$(".loader").remove();
	$('#childrenHere').before("<img src='images/ajax-loader.gif' height='100' width='100' class='loader'  />");
	var theCurrentPiece=$("li#"+$("#suggestChildren").attr("name"));
	var ideaText=(theCurrentPiece.parent("ol").hasClass("myTree") ? $("#textInFirstLI").text():theCurrentPiece.children("div:first").children(".pieceDescriptions").text());
	var theParentID=($("#secondLevel").length>0 ? $("#secondLevel").attr("onclick").substring(9,$("#secondLevel").attr("onclick").lastIndexOf(")")):"1");
	$.getJSON("getChildren.php?q="+ideaText+"&ParentID="+theParentID, function(data) { 
		if(data!=null){    
			recommendedChildren={};
			$("#childrenHere").empty();
			$.each(data, function(i, val){
				if($("#childrenHere>li").length>9){
					recommendedChildren[val.id]=val.label;	
				}
				else{
					createChild(val.id,val.label,"childrenHere"); 
				}
			});	
		}
		$(".loader").remove();
	});
	if($(".children").children("li").length==0){
		$("ol#parentList"+$("#suggestChildren").attr("name")).append("<li id='pointer_spot_holder' class='pointer_spot grandchildLi'><div class='textHolder'><img src='images/Pointer_Right.png' height='16' width='14' /></div></li>");	
		$(".children").append("<li name='pointer_spot_holder'></li>");
		$("#pointer_spot_holder>.textHolder").append($("#newPiece"));
		$("#newPiece").focus();
	}
	createTimeline();
	makeChildrenSortable();
	expandBox();
}
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function textPiece(){
	label=htmlEntities($('#newPiece').val());
	$('#newPiece').autocomplete("close");
	if(label.length>0){
		if(label.length<101){
			$('#newPiece').val("");
			id=n;
			var childSpot=($("#pointer_spot_holder").length>0 ? "pointer_spot_holder":"childrenHere");
			createChild("Text"+id,label,childSpot);
			n++;
		}
		else{
			alert("You're piece is over 100 characters. This means it should probably be broken into two separate pieces.");
		}
	}
}
function swapImage(imageToChange,imgSrc){
	$('#'+imageToChange).attr('src',"images/"+imgSrc);
	$('#'+imageToChange).css('cursor','pointer');
}
function deletePiece(thePieceID,thePiece,ProjectID){
	if(thePieceID=="topPiece"){
		return;
	}
	var r=confirm("Are you sure you want to delete?");
	if(r==true){
		tagRemove();
		$.ajax({
			url:"AjaxQueries.php?QueryNumber=1",
			data:"PieceID="+thePieceID+"&ProjectID="+ProjectID,
			method:"DELETE"
		});
		subbranch=$('#'+thePieceID).children("ol").contents();
		$('#'+thePieceID).parent('ol').append(subbranch);
		$('#'+thePieceID).remove();	
		createTimeline();
	}
}
function downBranch(branch){//if branchid doesn't exist recurse over additional branches til it does
	tagRemove();
	window.scroll(0,0);
	$("#movePiece").removeAttr("name");
	$(".blueHighlight").removeClass("blueHighlight");
	$(".timeline_container").css("opacity","0.5");
	$("#newPieceEntry").append($("#newPiece").removeClass("newPieceOutOfConsole"));
	$("#pointer_spot_holder").remove();
	//Set up branch equal to the place where the piece gets appended, same with top branch.
	var branchID=branch.substring(10);
	var newBranch=$("#"+branchID);
	$(newBranch).children("ol").hide();
	$("#pointerSpot").hide();
	$("#myTree").append($(newBranch));
	$(newBranch).children(".textHolder").removeClass("firstChildLiLeftSelected").css({"position":"absolute","left":$("#"+branchID).position().left+"px","top":$("#"+branchID).position().top+"px"}).children(".pieceDescriptions").css({"text-align":"left"});
	$("#myTree").children("li:first").css({"position":"absolute","left":$("#myTree").children("li:first").position().left+"px","top":$("#myTree").children("li:first").position().top+"px"}).animate({opacity:"0",top: '+=' + $(this).height()/4,
        left: '+=' + $(this).width()/4,
        width: "0px",height:"0px"},350,function(){		
		$("#myTree").children("li").children("ol").hide();
	});
	$(newBranch).children(".textHolder").animate({"min-height":"50px","width":"90%","margin-bottom":"30px","top":"0px","left":"42px"},500,function(){
		$("#myTree").children("li:first").remove();
		$(newBranch).removeClass("left right").css("padding-top","0px").children(".textHolder").removeClass("textHolder firstChildLiRight firstChildLiLeft").attr("id","firstLI").children(".pieceDescriptions").removeClass("pieceDescriptions").removeAttr("style").attr("id","textInFirstLI").addClass("textInFirstLISelected");
		$("#firstLI").removeAttr("ondblclick");
		$("#textInFirstLI").attr("onclick",$("#firstLI").attr("onclick").replace(/firstChildLiLeftSelected/,"textInFirstLISelected").replace(/this.parentNode.id/,"this.parentNode.parentNode.id"));
		$("#firstLI").removeAttr("onclick");
		$(newBranch).children("#firstLI").css({"position":"","top":"","left":""});
		$("#myTree").children("li:first").before($(newBranch));
		$("#myTree").children("li:first").children("ol").slideDown(350,function(){
			adjustTimelineHeight();
			$(".timeline_container").animate({"opacity":"1.0"});
		});
		if($("li#"+branchID).children("ol").children("li").length==0){//THis could be optimized since should only happen on startpiece issset
			$(".loader").remove();
			$('body').append("<img src='images/ajax-loader.gif' height='100' width='100' class='loader' style='position:absolute; top:300px; left:500px' />");
			$('#myTree').css({'opacity':'0.5'});
			additionalBranches(branchID,0,0,1);
			if(isTemplate){
				$.get("GetPieceID.php?ProjectID="+ProjectID+"&PieceDescription="+$("#textInFirstLI").text(),function(data){
					createBranch(data,$("#myTree").children("li:first").attr("id"));
				});
			}
		}
		else{
			$("li#"+branchID).children("ol").children("li").each(function(index, element) {
				additionalBranches(element.id,0,0);
			});	
		}
		showUpToGrandChildren();
		adjustTimelineHeight();
		createTimeline();			
		changeSummaryPanel(branchID);
		$(".moreInfo").remove();
	}).children(".pieceDescriptions").animate({"font-size":"18px","padding-left":"50px","font-weight":"bold","margin-top": "25px","margin-left":"100px","max-width":"500px"});
	backForwardButton=false;
	window.location.hash="#StartPiece="+branchID+(window.location.hash.indexOf("ProjectID")>-1 ? "/"+window.location.hash.substr(window.location.hash.indexOf("ProjectID")):"");
}
//Check to see if we need calldown
function additionalBranches(branchID,callDown,level,timeline){
	//Could probably be loaded at start.
	if($(branchID).children("ol").children("li").length!=0){
		checkBranches($("#myTree"));
		return false;
	}
	$.getJSON("GetTreeBranchWithData.php?"+($("#ProjectID").attr("data-private")==1 ? "ProjectID="+document.getElementById("ProjectID").value+"&Private":"")+"PieceID="+branchID,function(data){
		docFrag=document.createDocumentFragment();
		if(data!=null){
			w=1;
			recurseData(data,docFrag,1);
			$(docFrag).children("li:first").children("ol:first").children("li").each(function(index, element) {
                if($("#"+element.id).length==0){
					$("#parentList"+branchID).append(element);
				}
				else{
					if($("#parentList"+element.id).contents().length==0){
						$("#parentList"+element.id).append($(element).children("ol").children("li"));
					}
				}
            });
			//$("#parentList"+branchID).empty().append($(docFrag).children("li:first").children("ol:first").contents());
			if(level){
				$("#parentList"+branchID).children("li").each(function(index, element) {
					additionalBranches(element.id,0,0);
				});
			}
			else{
				$(".loader").remove();
				$("#myTree").animate({"opacity":"1.0"});
			}
			if(callDown){
				downBranch("branchDown"+branchID);
			}
			if(timeline){
				showUpToGrandChildren();
				createTimeline();
				adjustTimelineHeight();				
			}
		}
		else{
			$(".loader").remove();
			$("#myTree").animate({"opacity":"1.0"});
		}
		checkBranches($("#myTree"));
	});
}
function upBranch(branchID){
	tagRemove();
	if($("li#"+branchID).length==0){
		$(".treeLocItem").removeAttr("onclick");
		$("#topLevelPiece").hide();
		window.scroll(0,0);
		$("#movePiece").removeAttr("name");
		$("#newPieceEntry").append($("#newPiece").removeClass("newPieceOutOfConsole"));
		$("#pointerSpot").hide();	
		$(".loader").remove();
		$("body").append("<img src='images/ajax-loader.gif' height='100' width='100' class='loader' style='position:absolute; top:300px; left:500px' />");
		$(".timeline_container,#myTree").css("opacity","0.5");
		w=1;
		$.getJSON("GetTreeBranchWithData.php?"+($("#ProjectID").attr("data-private")==1 ? "ProjectID="+document.getElementById("ProjectID").value+"&Private":"")+"PieceID="+branchID, function ajaxUpBranch(data){
		$("#myTree").children("li:first").children("ol").remove();
		var myTreeFirst=$("#myTree").children("li:first").remove();
		$("body").append(myTreeFirst);
		myTreeFirst.children("#firstLI").css({"position":"absolute","top":"215px","left":"204px"});
		frag=document.createDocumentFragment();
		recurseData(data,frag,0);
		document.getElementById("myTree").appendChild(frag);
		$("#myTree").animate({"opacity":"1.0"});
		$(".loader").remove();
		var onclickAttr=$("#textInFirstLI").attr("onclick");
		onclickAttr=onclickAttr.substr(12).split(",");
		selectPiece($("#textInFirstLI"),"textInFirstLISelected",onclickAttr[2]=="true",onclickAttr[3]=="true",onclickAttr[4]=="true",onclickAttr[5]=="true",branchID,0);
		showUpToGrandChildren();
		createTimeline();
		myTreeFirst.children("div:first").children("div:first").css({"min-height":"0px","margin":"0 0 0 25px"});
		myTreeFirst.children("div:first").animate({"left":$("li#"+myTreeFirst.attr("id")+":first").offset().left+"px","top":$("li#"+myTreeFirst.attr("id")+":first").offset().top+"px","width":"350px","margin-left":"50px","opacity":"0.5"},function(){
			$(myTreeFirst).remove();
			$(".timeline_container").animate({opacity:"1.0"});
			adjustTimelineHeight();	
		});
		$("#myTree").append($(".last"));			
		delete(w);	
		if(isTemplate){
			$.get("GetPieceID.php?ProjectID="+ProjectID+"&PieceDescription="+$("#textInFirstLI").text(),function(data){
				createBranch(data,$("#myTree").children("li:first").attr("id"));
			});
		}
		checkBranches($("#myTree"));
		}).error(function(){
			$(".loader").remove(); 
			$(".timeline_container").animate({opacity:"1.0"}); 
			$("#myTree").animate({"opacity":"1.0"});
			alert("There was an error loading this project. Try refreshing the page.");
		});
	}
	backForwardButton=false;
	window.location.hash="#StartPiece="+branchID+(window.location.hash.indexOf("ProjectID")>-1 ? "/"+window.location.hash.substr(window.location.hash.indexOf("ProjectID")):"");
}
function recurseData(data, treeToAppend,hidden) {
	if(data!=null){
		$.each(data, function(index1,element){
			$.each(element,function(index, piece){
				$.each(piece, function(zero, pieceInfo) {
				for(var r in pieceInfo.PieceDescription){
					if(w!=1){
						listItem=document.createElement("li");
						listItem.setAttribute("id",index);
						listItem.setAttribute("class","treeItem");
						listItem.setAttribute("data-pm",pieceInfo.IsAdmin);
						listItem.setAttribute("data-bid",pieceInfo.BidID);
						
						textHolder=document.createElement("div");
						textHolder.setAttribute("class","textHolder");
						textHolder.setAttribute("onclick",'selectPiece(this,"firstChildLiLeftSelected",'+(pieceInfo.Innovative ? "true":"false")+','+(pieceInfo.Useful ? "true":"false")+','+(pieceInfo.NotUseful ? "true":"false")+','+(pieceInfo.Spam ? "true":"false")+',this.parentNode.id)');
						textHolder.setAttribute("ondblclick",'downBranch("branchDown'+index+'")');
						
						icons=document.createElement("span");
						icons.setAttribute("class","icons");
						
						pieceDesc=document.createElement("div");
						pieceDesc.setAttribute("class","pieceDescriptions");
						pieceDesc.innerHTML=r;
						if(ProjectOwner==1 || pieceInfo.IsAssignee!=0){
							if(pieceInfo.IsFinished==0){
								checkBox=document.createElement("input");
								checkBox.type="checkbox";
								checkBox.setAttribute("onclick","clickCheckbox(this)");
								checkBox.setAttribute("class","alignBottom");
								checkBox.setAttribute("id","c"+index);
								
							}
							else{
								checkBox=document.createElement("img");
								checkBox.src="images/checkmark.png";
								checkBox.setAttribute("class","alignBottom");
								checkBox.width=18;
								checkBox.height=18;
								checkBox.alt="checkmark";	
							}
							pieceDesc.insertBefore(checkBox,pieceDesc.firstChild);
						}
						orderedList=document.createElement("ol");
						orderedList.setAttribute("id","parentList"+index);
						orderedList.setAttribute("class","noDisplay");
						textHolder.appendChild(icons);
						textHolder.appendChild(pieceDesc);
						listItem.appendChild(textHolder);
						listItem.appendChild(orderedList);										
						treeToAppend.appendChild(listItem);
					}
					else{
						listItem=document.createElement("li");
						listItem.setAttribute("id",index);
						listItem.setAttribute("class","center");
						listItem.setAttribute("data-pm",pieceInfo.IsAdmin);
						listItem.setAttribute("data-bid",pieceInfo.BidID);
						
						firstLI=document.createElement("div");
						firstLI.setAttribute("id","firstLI");
						
						textInFirstLI=document.createElement("div");
						textInFirstLI.setAttribute("id","textInFirstLI");
						textInFirstLI.setAttribute("class","textInFirstLISelected");
						textInFirstLI.setAttribute("onclick",'selectPiece(this,"textInFirstLISelected",'+(pieceInfo.Innovative ? "true":"false")+','+(pieceInfo.Useful ? "true":"false")+','+(pieceInfo.NotUseful ? "true":"false")+','+(pieceInfo.Spam ? "true":"false")+',this.parentNode.parentNode.id)');
						textInFirstLI.innerHTML=r;
						
						orderedList=document.createElement("ol");
						orderedList.setAttribute("id","parentList"+index);
		
						firstLI.appendChild(textInFirstLI);
						listItem.appendChild(firstLI);
						listItem.appendChild(orderedList);										
						treeToAppend.appendChild(listItem);						
					}
					w++;							
					if(pieceInfo.PieceDescription[r]!=null){
						recurseData(pieceInfo.PieceDescription[r], treeToAppend.lastChild.lastChild,hidden);
					}	
				}
			});
		});
	});	
	}
}
function sendNewPCRSc(parent,olderSibling,pieceID){
	$.post("AjaxQueries.php?QueryNumber=7","PieceID="+pieceID+"&ParentPieceID="+parent+"&SiblingPieceID="+olderSibling+"&ProjectID="+document.getElementById('ProjectID').value);
}
function voteCheck(voteID,voteInno,voteUseful,voteNotUseful,voteSpam){
	var votesArray=votes[voteID];
	$(".markSpamCast").removeClass("markSpamCast");
	$(".notUsefulCast").removeClass("notUsefulCast");
	$(".innovativeCast").removeClass("innovativeCast");
	$(".usefulCast").removeClass("usefulCast");		
	$("#voteNotUseful,#voteUseful,#voteInnovative").attr({"name":voteID});
	switch(true){
		case (jQuery.inArray("Useful",votesArray)>-1 || voteUseful):
		$("#voteUseful").addClass("usefulCast");
			if(typeof votes[voteID]=="undefined"){
				votes[voteID]=new Array();
			}
			votes[voteID].push("Useful");
			break;
		case (jQuery.inArray("Not Useful",votesArray)>-1 || voteNotUseful):
			$("#voteNotUseful").addClass("notUsefulCast");
			if(typeof votes[voteID]=="undefined"){
				votes[voteID]=new Array();
			}
			votes[voteID].push("Not Useful");
			break;
	}
	if(jQuery.inArray("Spam",votesArray)>-1 || voteSpam){
		$("#markSpam").addClass("markSpamCast");	
	}
	if(jQuery.inArray("Innovative",votesArray)>-1 || voteInno){
		$("#voteInnovative").addClass("innovativeCast");
		if(typeof votes[voteID]=="undefined"){
			votes[voteID]=new Array();
		}
		votes[voteID].push("Innovative");
	}
}
function votePiece(voteID,theVote){
	switch(theVote){
		case "Not Useful":
			if($("#voteNotUseful").hasClass("notUsefulCast")){
				removeVote(voteID,theVote);
				return;
			}
		break;
		case "Useful":
			if($("#voteUseful").hasClass("usefulCast")){
				removeVote(voteID,theVote);
				return;
			}
		break;
		case "Innovative":
			if($("#voteInnovative").hasClass("innovativeCast")){
				removeVote(voteID,theVote);
				return;
			}
		break;
		case "Spam":
			if($("#markSpam").hasClass("markSpamCast")){
				removeVote(voteID,theVote);
				return;
			}
		break;
	}
	tagRemove();
	xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			//console.log(xmlhttp.responseText);
			if(typeof votes[voteID]=="undefined"){
				votes[voteID]=new Array();
			}
			votes[voteID].push(theVote);
			switch(theVote){
				case "Not Useful":
					$("#voteNotUseful").addClass("notUsefulCast");
					$("#voteUseful").removeClass("usefulCast");
				break;
				case "Useful":
					$("#voteUseful").addClass("usefulCast");
					$("#voteNotUseful").removeClass("notUsefulCast");
				break;
				case "Innovative":
					$("#voteInnovative").addClass("innovativeCast");
				break;
				case "Spam":
					$("#markSpam").addClass("markSpamCast");
				break;
			}
		}
	}
	xmlhttp.open((theVote!="Spam" ? "GET":"DELETE"),"AjaxQueries.php?QueryNumber="+(theVote!="Spam" ? 10:1)+"&PieceID="+voteID+"&Vote="+theVote,true);
	if(theVote!="Spam"){
		xmlhttp.send();
	}
	else{
		xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlhttp.send("PieceID="+voteID+"&Vote="+theVote);
	}
}
function removeVote(voteID,theVote){
	xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4 && xmlhttp.status==200) {
			//console.log(xmlhttp.responseText);
			switch(theVote){
				case "Not Useful":
					$("#voteNotUseful").removeClass("notUsefulCast");
				break;
				case "Useful":
					$("#voteUseful").removeClass("usefulCast");
				break;
				case "Innovative":
					$("#voteInnovative").removeClass("innovativeCast");
				break;
				case "Spam":
					$("#markSpam").removeClass("markSpamCast");
				break;
			}
		}
	}
	xmlhttp.open("GET","AjaxQueries.php?QueryNumber=23&PieceID="+voteID+"&Vote="+theVote,true);
	xmlhttp.send();	
}
function tagPiece(thePiece,theText){
	$("body").append("<div id='thePiece'>"+theText+"</div>");
	$("#thePiece").css({"left":$(thePiece).offset().left-($(thePiece).attr("id").indexOf("thing")>-1 || $(thePiece).attr("id").indexOf("First")>-1? 74:65)+"px","top":$(thePiece).offset().top-35+"px"});
	$("#thePiece").addClass("notifyAfter");
}
function tagRemove(){
	if(typeof document.getElementById("thePiece")!="undefined"){
		$("#thePiece").remove();
	}
}
function editPiece(pieceID){	
	if(!parseInt(pieceID)){
		alert("Please select a piece to edit.");
		return;
	}
	tagRemove();
	if($("#ProjectID").attr("data-private")!=1){
		$.getJSON("AjaxQueries.php?QueryNumber=13&PieceID="+pieceID, function(data) { 
			if(data.length!=0){	
				htmlForEdits="<div id='aSlider'><div style='margin-top:10px; height:180px; margin-bottom:10px;'><div id='sliderHandle'></div></div></div><div id='wrapEdits'><div id='innerEdits'><table class='editChoices'><tr><td style='font-weight:bold; font-size:18px;'>Choose an edit</td></tr>";
				var counter=0;
				$.each(data,function(index, element) {
					counter++;
					htmlForEdits+="<tr><td id='edit"+index+"' onclick='submitEditVote(this.id.substring(4),"+pieceID+")'>"+counter+") <span  class='pseudoLink'>"+element.replace(/'/g, "&apos;").replace(/"/g, "&quot;")+"</span></td></tr>";
				});
				delete(counter);
				htmlForEdits+="<tr><td align='center'></td></tr></table></div></div>";
				$("body").append("<div id='Edits'>"+htmlForEdits+"</div>");
				$("#Edits").addClass("suggestedBranchesBubble "+($("#"+pieceID).offset().left>$("body").width()/2 ? "sbbRight":"sbbLeft"));
				$("#Edits").css({"display":"inline-block","left":($("#"+pieceID).offset().left>$("body").width()/2 ? "27%":"43%"),"top":($("#"+pieceID).offset().top-35)+"px"});
				customScrolling("Edits","innerEdits");
			}
		});
	}
	var pieceToEdit=$("#"+pieceID).children(".textHolder").children(".pieceDescriptions").text().replace(/'/g, "&apos;").replace(/"/g, "&quot;");		
	contentsOfLi=$("#"+pieceID).children(".textHolder").contents();
	$("#newPieceEntry").append($("#newPiece").removeClass("newPieceOutOfConsole"));
	$(".pointer_spot").remove();
	$("#pointerSpot").hide();
	$("#"+pieceID).children(".textHolder").empty().removeClass("blueHighlight").css("min-width","90%").append("<input type='text' id='textEdit' onkeydown='if (event.keyCode == 13) submitEditVote(0,"+pieceID+")' value='"+pieceToEdit+"' /><div class='panelButtons' onclick='submitEditVote(0,"+pieceID+")' style='width: 50px; display: inline; padding-left: 5px; padding-right: 5px; padding-top: 2px; padding-bottom: 3px;'>Submit</div>");
	$("#textEdit").focus();
	
}
function submitEditVote(editID,pieceID){
	if($("#ProjectID").attr("data-private")==1){
		theEdit=document.getElementById("textEdit").value;
		$.post("AjaxQueries.php?QueryNumber=15","Private=1&ProjectID="+document.getElementById("ProjectID").value+"&PieceID="+pieceID+"&IdeaDescription="+encodeURIComponent(theEdit));
		replaceEditText();
		$("#"+pieceID).children(".textHolder").children(".pieceDescriptions").text(theEdit);//could be redundant need to check
		return;	
	}
	if(editID){
		$.post("AjaxQueries.php?QueryNumber=14","IdeaID="+editID+"&PieceID="+pieceID,function(data){
			$(".editChoices").empty().append("<h3>Vote submitted.</h3>");
			setTimeout(function(){replaceEditText();},500);
		});		
	}
	else{
		theEdit=document.getElementById("textEdit").value;
		if(theEdit.length<101){
			$.post("AjaxQueries.php?QueryNumber=15","PieceID="+pieceID+"&IdeaDescription="+encodeURIComponent(theEdit),function(data){					
				setTimeout(function(){replaceEditText();});
			});			
		}
		else{
			alert("You're piece is over 100 characters. This means it should probably be broken into two separate pieces.");
		}
	}	
}
function replaceEditText(){
	if(typeof contentsOfLi!="undefined"){
		$("#textEdit").parent(".textHolder").html(contentsOfLi);
		delete(contentsOfLi);
		$("#Edits").remove();
	}
}
function selectPiece(theDiv,theClass,innovative,useful,notUseful,spam,pieceID,shouldGetBranches){
	growLI(pieceID);
	if(pieceID==dblClickCheck){
		$("#clipboardPanel").after($("#branches").removeAttr("class").attr("style","").hide());
		return;
	}
	replaceEditText();
	shouldGetBranches = typeof shouldGetBranches !== 'undefined' ? false : true;
	dblClickCheck=pieceID;
	highlightOption(theDiv,theClass);
	var childDescriptions={};
	$("ol.children,#childrenHere").empty();
	$("li#"+pieceID).children("ol:first").children("li").each(function(index, element) {
		if(element.id!="pointer_spot_holder" && element.id!="temp_spot_holder"){
       		$("ol.children").append("<li name='"+element.id+"'>"+htmlEntities($(element).children(".textHolder").children(".pieceDescriptions").text())+"</li>");
		}
    });
	makeChildrenSortable();
	if($("#ProjectID").attr("data-private")!=1){
		voteCheck(pieceID,innovative,useful,notUseful,spam);
		checkForEdits(pieceID);
	}
	if($("#"+pieceID).attr("data-pm")==0 && $("#markSpam").length==0){
		$("#deletePiece").after('<div class="tools" id="markSpam" onmouseover="tagPiece(this,"Mark piece as spam")" onmouseout="tagRemove()" onclick="votePiece(this.attributes["name"].value,"Spam")" name=""></div>').remove();
	}
	else{
		if($("#"+pieceID).attr("data-pm")==1 && $("#deletePiece").length==0){
			$("#markSpam").after('<div name="" id="deletePiece" onclick="deletePiece(this.attributes[&quot;name&quot;].value,$(&quot;li#&quot;+this.attributes[&quot;name&quot;].value),'+ProjectID+')" onmouseover="tagPiece(this,&quot;Delete this piece&quot;)" onmouseout="tagRemove()" class="tools"></div>').remove();
		}
	}
	if(theClass!="textInFirstLISelected"){
		$("#markSpam,#deletePiece,#editPiece,#suggestChildren,#movePiece").attr("name",pieceID);
	}
	else{
		$("#markSpam,#deletePiece,#editPiece,#movePiece").removeAttr("name");
		$("#suggestChildren").attr("name",pieceID);
	}
	$("#suggestedBranches").css("background-color","#FFF");
	if(shouldGetBranches){
		getPossibleBranches(0,pieceID,1,1);
	}
	changeSummaryPanel(pieceID);	
}
function checkForEdits(pieceID){
	$.getJSON("AjaxQueries.php?QueryNumber=13&PieceID="+pieceID, function(data) { 
		if(data.length!=0){
			$("#editPiece").css("background","url('images/Has_Edits.png')");
			$("#editPiece").hover(function(){
				$(this).css("background","url('images/Has_Edits_Rollover.png')");
			},function(){
				$(this).css("background","url('images/Has_Edits.png')");	
			});
		}
		else{
			$("#editPiece").css("background","url('images/Edit.png')");
			$("#editPiece").hover(function(){
				$(this).css("background","url('images/Edit_Rollover.png')");
			},function(){
				$(this).css("background","url('images/Edit.png')");
			});
		}
	});
}
function makeChildrenSortable(){//check what happens on save
	$("ol.children").sortable({
		stop: function(event, ui) {
				var olderSiblingID,parentID;
				if(typeof $(ui.item).next("li").attr("name")!="undefined"){
					$("li#"+$(ui.item).next("li").attr("name")).before($("li#"+$(ui.item).attr("name")));
				}
				else{
					$("li#"+$(ui.item).attr("name")).parent("ol").children("li:last").after($("li#"+$(ui.item).attr("name")));
				}
				if($(ui.item).attr("name").indexOf("pieceID")==-1){
					var prevElement=$("li#"+$(ui.item).attr("name")).prev("li");
					while(typeof $(prevElement).attr("id")!="undefined" && $(prevElement).attr("id").indexOf("pieceID")>-1){
						prevElement=$(prevElement).prev("li");
					}
					if(typeof $(prevElement).attr("id")!="undefined"){
						olderSiblingID=$(prevElement).attr("id");
					}
					else{
						olderSiblingID="NULL";
					}					
					theParentID=$("li#"+$(ui.item).attr("name")).parent("ol").parent("li").attr("id");
					sendNewPCRSc(theParentID,olderSiblingID,$(ui.item).attr("name"));
				}
				createTimeline();
			},
	});
	$("ol#childrenHere").sortable({
		stop:function(event,ui){	
			if($(ui.item).parent().hasClass("children")){		
				if(typeof $(ui.item).next("li").attr("name")!="undefined"){
					$("li#"+$(ui.item).next("li").attr("name")).before($(ui.item).attr("name",$(ui.item).attr("id")).clone());
					$(ui.item).removeAttr("id");
					$("li#"+$(ui.item).attr("name")).addClass("treeItem").children(".textHolder").children(".icons").children().show();
				}
				else{
					$("li#"+$(ui.item).prev("li").attr("name")).parent("ol").children("li:last").after($(ui.item).attr("name",$(ui.item).attr("id")).clone());
					$(ui.item).removeAttr("id");
					$("li#"+$(ui.item).attr("name")).addClass("treeItem").children(".textHolder").children(".icons").children().show();
				}
				createTimeline();
			}
		},
		connectWith: ".children"});
}
function highlightOption(theDiv,theClass){
	if($(".firstChildLiLeftSelected").length>0){
		shrinkLI($(".firstChildLiLeftSelected").parent("li").attr("id"));
		$(".firstChildLiLeftSelected").removeClass("firstChildLiLeftSelected"); 
	}
	$(".textInFirstLISelected").removeClass("textInFirstLISelected");
	if($(".blueHighlight").length>0){
		shrinkLI($(".blueHighlight").parent("li").attr("id"));
		$(".blueHighlight").removeClass("blueHighlight");
	}
	if($(theDiv).is(".firstChildLiRight,.firstChildLiLeft, #textInFirstLI")){
		$(theDiv).addClass(theClass);	
	}
	else{		
		$(theDiv).addClass("blueHighlight");
	}
}
function summarize(){
	$("#summaryPanel").show();
	$("#clipboardPanel,#branches").hide();
	$("#clipboard,#suggestedBranches").removeClass("optionsActive");
	$("#summary").addClass("optionsActive");
}
function clipboard(){
	$("#summaryPanel,#branches").hide();
	$("#clipboardPanel").show();
	$("#clipboard").addClass("optionsActive");
	$("#summary,#suggestedBranches").removeClass("optionsActive");
}
function suggestBranches(){
	$("#summaryPanel,#clipboardPanel").hide();
	$("#branches").show();
	$("#suggestedBranches").addClass("optionsActive");
	$("#summary,#clipboard").removeClass("optionsActive");
}
function changeSummaryPanel(pieceID){//call function to get prev
	$.getJSON("AjaxQueries.php?QueryNumber=21&PieceID="+pieceID+($("#ProjectID").attr("data-private")==1 ? "&private=true&ProjectID="+document.getElementById("ProjectID").value:""),function(data){
		var firstItem="<div class='treeLocItem' id='firstLevel'>"+($("li#"+pieceID).children("#firstLI").length>0 ? $("#textInFirstLI").text():$("li#"+pieceID).children("div:first").children(".pieceDescriptions").text())+"</div>";
		secondItem="";
		thirdItem="";
		if(data!=null){
			for(index in data[0]){
				secondItem="<div class='treeLocItem' onclick='upBranch("+index+")' id='secondLevel'><span style='opacity:0.75'>"+data[0][index]+"</span></div>";
			}
        	for(index in data[1]){
				thirdItem="<div class='treeLocItem' onclick='upBranch("+index+")' id='thirdLevel'><span style='opacity:0.5'>"+data[1][index]+"</span></div>";
			}
		}
		$("#treeLoc").empty().append(thirdItem+secondItem+firstItem);
		$("#topLevelPiece").hide();
		if(thirdItem=="" && secondItem==""){
			$(".treeLocItem").css("border-left","none");
		}
		else{
			$(".treeLocItem").css("border-left","3px solid black");
			var textOfTop=$("#topLevelPiece").children("span").text();
			if(typeof data[1]!="undefined" && typeof data[0]!="undefined"){
				if(data[1][index]!=textOfTop && data[0][index]!=textOfTop){
					$("#topLevelPiece").show();	
				}
			}
		}
	});
}
function openClosePanel(thePanel){
	$("#"+thePanel).slideToggle();
	switch(thePanel){
		case "treeLoc": $("#pieceGallery,#helpOptions").slideUp();
		$("#pieceGallBar,#help").removeClass("horizClose").addClass("horizOpen");
		if($("#treeLocBar").hasClass("horizOpen")){
			$("#treeLocBar").removeClass("horizOpen").addClass("horizClose");
		}
		else{
			$("#treeLocBar").removeClass("horizClose").addClass("horizOpen");	
		}
		break;
		case "pieceGallery": $("#treeLoc,#helpOptions").slideUp();
		$("#treeLocBar,#help").removeClass("horizClose").addClass("horizOpen");
		if($("#pieceGallBar").hasClass("horizOpen")){
			$("#pieceGallBar").removeClass("horizOpen").addClass("horizClose");
		}
		else{
			$("#pieceGallBar").removeClass("horizClose").addClass("horizOpen");	
		}
		break;
		case "helpOptions": $("#pieceGallery,#treeLoc").slideUp();
		$("#pieceGallBar,#treeLocBar").removeClass("horizClose").addClass("horizOpen");
		if($("#help").hasClass("horizOpen")){
			$("#help").removeClass("horizOpen").addClass("horizClose");
		}
		else{
			$("#help").removeClass("horizClose").addClass("horizOpen");	
		}
		break;	
	}
}
function moveThisPiece(){
	if(typeof $("#movePiece").attr("name")!="undefined"){
		thePiece=$('li#'+$("#movePiece").attr("name"));
	}
	else{
		if(pieceActivatedForMove){
			insertPiece($(clonedPiece));
		}
		return;
	}
	if(pieceActivatedForMove){
		insertPiece($(clonedPiece));
	}
	else{
		pieceActivatedForMove=true;
		clonedPiece=$(thePiece).clone();
		$(clonedPiece).removeAttr("ondblclick");
		$("body").append($(clonedPiece).css({"position":"absolute","left":($(thePiece).offset().left)+"px","top":($(thePiece).offset().top)+"px"}));
		$(thePiece).addClass("halfOpacity");	
		$(clonedPiece).animate({"top":"200px"});
		document.getElementById("movePiece").innerHTML="Place piece here";
	}
}
function projectAsTemplate(){
	if(ProjectID==26){
		var firstLevelSave=true;
	}
	$("#myTree").children("li:first").children("ol").empty();
	document.getElementById("textInFirstLI").insertAdjacentHTML("afterBegin",$("#myUsername").text()+"'s Project: ");
	saveFirst(1);
	if(firstLevelSave){
		if(typeof branchIsCreated!="undefined" && branchIsCreated.state()!="pending"){
			saveFirstLevel();
			delete(branchIsCreated);
		}
		else{
			endWaitForFirst=setInterval(function(){
				if(typeof branchIsCreated!="undefined" && branchIsCreated.state()!="pending"){
					saveFirstLevel();
					clearInterval(endWaitForFirst);
					delete(branchIsCreated);
				}
			},250);
		}
	}
	$(".loader").remove();
	$("#myTree").animate({opacity:1},500);
}
function saveFirstLevel(){
	setTimeout(function(){
		if($("#myTree").children("li").children("ol").children("li").length>0){
			$("#myTree").children("li").children("ol").children("li").each(function(index, element) {
				$(element).children(".textHolder").children(".icons").children("img:first").click();
			});
		}
		else{
			saveFirstLevel();	
		}
	},250);
	delete(firstLevelSave);
}
function setPosVars() {
    initialTop = parseInt($("#panelRight").position().top);
    height  = parseInt($("#branches").height());
    initialBottom = parseInt($("#bottomFixedScroll").position().top);
    initialLeft = parseInt($("#panelRight").position().left);
    fixedPositionMenu = true;
    if ($(window).height() < height) {
       fixedPositionMenu = false;
    }
}
function closePanel(){
	if($("#panelRight").css("width")=="230px"){
		$("#panelRight").animate({"width":"20px"});
		$("#closePanelButton").attr("id","openPanelButton");
	}
	else{
		$("#panelRight").animate({"width":"230px"});
		$("#openPanelButton").attr("id","closePanelButton");
	}
}
function youtubeVideo(theLink){
	$('<div ><img src="images/X_Button.png" class="simple-modal-close" onClick="$.modal.close()" /><iframe style="margin-left:90px; padding-top:85px;" width="560" height="315" src="'+theLink+'" frameborder="0" allowfullscreen></iframe></div>').modal({containerCss:{"background":"#0EAFFF"}});	
}
function addMoney(){
	$.get("webhook/GetPrizeAmount.php?ProjectID="+ProjectID,function(data){
		data=data;
		$.get("webhook/GetBalance.php",function(data2){
			$.modal('<div id="modalDiv"><img src="images/X_Button.png" class="simple-modal-close" onClick="$.modal.close()" /><div id="currentPrize" class="addMoneyModal">Current prize: '+data+'</div><table class="addMoneyModal"><tr><td id="creditsAvail">You have '+data2+' available.</td><td><div id="addMoneyToAccount" onclick="openUpdateCardIframe()" class="panelButtons">Add more money</div></td></tr><tr><td id="addYourMoney">How much do you want to add to this project\'s prize?</td><td><input type="text" id="actualPrizeAmount" class="amountToAdd" /></td></tr><tr><td>Amount deducted from your balance <a href="#" style="color:#0d1333" onclick="popitup(\'PrizeProjectRules.php?NoLayout#prizeDesc\')">(?)</a></td><td><input id="prizeWithCommission" class="amountToAdd" type="text" /></td></tr><tr><td></td><td><div id="submitMoneyToProject" class="panelButtons" onclick="fundProject(this)">Submit</div></td></tr></table></div>');
			$("#modalDiv").on("keyup","#prizeWithCommission,#actualPrizeAmount",function(e) {
				var periodSpot=$(this).val().indexOf(".");
				if(e.keyCode==190 || e.keyCode==46 || e.keyCode==110){
					if($(this).val().length==1){
						$(this).val("");
					}
					else{
						if(periodSpot!=$(this).val().lastIndexOf(".")){
							$(this).val($(this).val().substr(0,$(this).val().length-1));
						}	
					}
				}
				else{
					if(!((e.keyCode<58 && e.keyCode>47) || (e.keyCode<106 && e.keyCode>95))){
						if($(this).val().length==1){
							$(this).val("");
						}
						else{
							$(this).val($(this).val().substr(0,$(this).val().length-1));
						}
					}
					else{
						if($(this).attr("id")=="prizeWithCommission"){
							var prize = (($("#prizeWithCommission").val()*100)-Math.floor($("#prizeWithCommission").val()*5+0.5));
							prize=(prize/100).toFixed(2);
							$("#actualPrizeAmount").val(prize);
						}
						else{
							var prize = ($("#actualPrizeAmount").val()/0.95).toFixed(2);
							$("#prizeWithCommission").val(prize);
						}
					}
				}
				if(periodSpot!=-1 && (periodSpot+3)<$(this).val().length){
					$(this).val($(this).val().substr(0,$(this).val().length-1));
				}
			});
		});
	});
	
	//Get amount of money available
	//Get amount already contributed to project
	//
	
}
function fundProject(fundButton){
	if($("#actualPrizeAmount").val()==""){
		return;
	}
	var r=confirm("Are you sure you want to contribute $"+$("#actualPrizeAmount").val()+" to this project? $"+$("#prizeWithCommission").val()+" will be deducted from your account to cover this transaction.");
	if(r){
		$(".loader").remove();
		$(fundButton).after("<img src='images/ajax-loader.gif' height='20' width='20' class='loader' style='vertical-align:middle' />");
		$(fundButton).hide();
		$("#errorMessageOnAdd").remove();
		$("#prizeWithCommission,#actualPrizeAmount").attr("readonly","readonly").css("opacity","0.5");
		$.get("webhook/AddProjectPrize.php?ProjectID="+ProjectID+"&Amount="+$('#prizeWithCommission').val(),function(data){
			$(".loader").remove();
			if(!data){
				$("#modalDiv").empty().append("<div style='margin:0 auto; margin-top:250px'>Prize added to project</div>");
				$.get("webhook/GetPrizeAmount.php?ProjectID="+ProjectID,function(data){
					prizeAmount=data;
				});
				$.get("webhook/GetBalance.php",function(data){
					balance=data;
				});
				setTimeout(function(){
					$.modal.close();
					$("#prizeValue").html(prizeAmount);
					$("#accountBalance").html(balance)
				},500);
			}
			else{
				$("#prizeWithCommission").after("<div id='errorMessageOnAdd' style='color:red; text-align:right; clear:both;'>"+data+"</div>");
				$("#prizeWithCommission,#actualPrizeAmount").removeAttr("readonly").css("opacity","1.0");
				$(fundButton).show();
			}
		}).error(function(){
		});
	}
}
function openUpdateCardIframe(){
	$("#modalDiv").empty().append('<img src="images/X_Button.png" class="simple-modal-close" onClick="$.modal.close()" /><iframe src="webhook/AddCredit.php?ProjectID='+ProjectID+'" height="400" width="400" frameborder="0" class="addMoneyModal modalBox" scrolling="no" id="iframeCard"></iframe>');
}
function iframeClose(){
	$.get("webhook/GetPrizeAmount.php?ProjectID="+ProjectID,function(data){
		data=data;
		$.get("webhook/GetBalance.php",function(data2){
			$("#modalDiv").empty().append('<img src="images/X_Button.png" class="simple-modal-close" onClick="$.modal.close()" /><div id="currentPrize" class="addMoneyModal">Current prize: '+data+'</div><table class="addMoneyModal"><tr><td id="creditsAvail">You have '+data2+' available.</td><td><div id="addMoneyToAccount" onclick="openUpdateCardIframe()" class="panelButtons">Add more money</div></td></tr><tr><td id="addYourMoney">How much do you want to add to this project\'s prize?</td><td><input type="text" id="actualPrizeAmount" class="amountToAdd" /></td></tr><tr><td>Amount deducted from your balance <a href="#" style="color:#0d1333" onclick="popitup(\'PrizeProjectRules.php?NoLayout#prizeDesc\')">(?)</a></td><td><input id="prizeWithCommission" class="amountToAdd" type="text" /></td></tr><tr><td></td><td><div id="submitMoneyToProject" class="panelButtons" onclick="fundProject(this)">Submit</div></td></tr></table>');
			$("#accountBalance").html(data2);
		});
	});	
}
function splitPiece(pieceID){
	if(!parseInt(pieceID)){
		alert("Please select a piece to split.");
		return;
	}
	tagRemove();
	//fix so not even called on private projects
		$.getJSON("AjaxQueries.php?QueryNumber=32&PieceID="+pieceID, function(data) { 
		if(data.length!=0 && $("#ProjectID").attr("data-private")!=1){	
			htmlForSplits="<table class='editChoices'><tr><td align='center'><h3>Choose a way to split this piece</h3></td></tr>";
			$.each(data,function(index, element) {
				ideasText="";
				$.each(element.Ideas,function(ind,ele){
					ideasText+=ele+", ";
				});
				ideasText=ideasText.substring(0,ideasText.length-2);
				htmlForSplits+="<tr><td align='center'><input class='textButton' type='button' id='split"+element.IdeaIDs+"' value='"+ideasText+"' onclick='submitSplitVote(\""+element.IdeaIDs+"\","+pieceID+")' /></td></tr>";
            });
			htmlForSplits+="<tr><td align='center'><h3>or create your own</h3></td></tr>";
		}
		else{
			htmlForSplits="<table class='editChoices'><tr><td align='center'><h3>Split this piece</h3></td></tr>";
		}
		var pieceToSplit=$("#"+pieceID).children(".textHolder").children(".pieceDescriptions").text().replace(/'/g, "&apos;").replace(/"/g, "&quot;");
		htmlForSplits+="<tr><td align='center'><table><tr><td id='pieceToSplitText'>"+pieceToSplit+"</td><td><div class='textSplitWrapper'><div class='textSplitDiv'><input type='text' class='textSplit' /></div><div class='textSplitDiv'><input type='text' class='textSplit' /></div></div></td></tr></table></td></tr><tr><td align='right'><input id='addSplitInput' type='button' value='Add another split box' class='textButton' onclick='addSplitTextBox()' /><input type='button' value='Submit Split' class='textButton' onclick='submitSplitVote(0,"+pieceID+")' /></td></tr></table>";
		$("<div><img src='images/X_Button.png' onclick='$.modal.close()' class='simplemodal-close simple-modal-close' /><div id='Splits'>"+htmlForSplits+"</div></div>").modal({containerCss:{
			background:"#FFF",
			border:"1px solid black"	
			}
		});
		$(".editChoices").css("margin-top",(480-$(".editChoices").height())/2+"px");
	});
}
function addSplitTextBox(){
	if($(".textSplit").length<10){
		$(".textSplitWrapper").append("<div class='textSplitDiv'><input type='text' class='textSplit' /></div>");	
		$(".editChoices").css("margin-top",(480-$(".editChoices").height())/2+"px");
	}
}
function submitSplitVote(splitID,pieceID){
	if(splitID && $("#ProjectID").attr("data-private")!=1){
		$.get("AjaxQueries.php?QueryNumber=33&SplitVote="+splitID+"&PieceID="+pieceID);
		$(".editChoices").empty().append("<h3>Vote submitted.</h3>");
		setTimeout("$.modal.close();",500);
	}
	else{
		splitsArray=new Array();
		$(".textSplit").each(function(index, element) {
            if(element.value!=""){
				splitsArray.push(encodeURIComponent(element.value));
			}
        });
		$.get(($("#ProjectID").attr("data-private")==1 ? "PrivateSplit.php?ProjectID="+document.getElementById("ProjectID").value:"AjaxQueries.php?QueryNumber=34")+"&SplitVote="+JSON.stringify(splitsArray)+"&PieceID="+pieceID,function(data){
			$(".editChoices").empty().append("<h3>"+($("#ProjectID").attr("data-private")==1 ? "Piece split.":"Vote submitted.")+"</h3>");
			setTimeout("$.modal.close();",500);
		});
	}
}
function assignment(BidID){//the data.length can be compressed into one block
	$('body').append("<img src='images/ajax-loader.gif' height='100' width='100' class='loader' style='position:absolute; top:50%; left:50%' />");
	var pieceID=$("#editPiece").attr("name");
	if(!parseInt(pieceID)){
		alert("Please select a piece to assign.");
		return;
	}
	tagRemove();
	$("#editPieceOptionsMenu").remove();
	$.get("AssignmentState.php?PieceID="+pieceID+($("#ProjectID").attr("data-private")==1 ? "&ProjectID="+document.getElementById("ProjectID").value+"&Private=true":"")+(typeof BidID!="undefined" ? "&BidID="+BidID:""),function(assignmentHtml){
		$(".loader").remove();
		if(typeof BidID!="undefined"){
			$("#assign"+BidID).remove();
			$("#acceptBid"+BidID).before(assignmentHtml);
		}
		else{
			$(assignmentHtml).modal({focus:false,containerCss:{
				background:"#FFF",
				border:"1px solid #0D1333",
				height:"285px",
				width:"450px"	
				}
			});
		}
		stWidget.addEntry({
			"service":"email",
			"element":document.getElementById('inviteFriends'),
			"url":window.location.href,
			"title":$(".pieceColor").text(),
			"type":"chicklet",
			"image":"https://ws.sharethis.com/images/email_16.png",
			"summary":$("#projDescription").text()   
		});
		autoCompleteAssignee();	
		var pickerString="#dtReminder"+(typeof BidID!="undefined" ? BidID:"")+",#dt"+(typeof BidID!="undefined" ? BidID:"");	
		$(pickerString).datetimepicker({ampm:true,minDate:0});
	});
}
function submitAssignment(){
	$("#errorMessage").remove();
	if($(".assigneeTag").length==0){
		$("#submitThisAssignment").before("<div id='errorMessage' style='color:red'>Please choose a user to assign this task to.</div>");
		return;
	}
	if($("#dt").val()==""){
		/*$("#submitThisAssignment").before("<div id='errorMessage' style='color:red'>Please set when this task should be completed by.</div>");
		return;*/
	}
	var selectedTime="";
	var datesArray=createDatesArray(new Array("#dt","#dtReminder"));
	if(datesArray[0]<datesArray[1]){
		$("#submitThisAssignment").before("<div id='errorMessage' style='color:red'>Please select a reminder date <u>before</u> the task is due</div>");
		return;
	}
	$("#simplemodal-data").css("opacity","0.5");
	$("#simplemodal-container").append("<img src='images/ajax-loader.gif' height='100' width='100' class='loader' style='margin-top:-50%; margin-left:35%;' />");
	$.post("processAssignUser.php",(datesArray[0] ? "dueDate="+datesArray[0]:"")+(datesArray[1] ? "&reminderDate="+datesArray[1]:"")+"&assigneeID="+$(".assigneeTag").attr("id")+($("#textReminder:checked").length>0 ? "&textReminder=1":"")+($("#emailReminder:checked").length>0 ? "&emailReminder=1":"")+"&pieceID="+$("#editPiece").attr("name")+($("#ProjectID").attr("data-private")==1 ? "&ProjectID="+document.getElementById("ProjectID").value+"&Private=true":""),function(data){if(data.length==0){setTimeout("$.modal.close();",500);}});
}
function createDatesArray(datesArray){
	arrayLength=datesArray.length;
	for(nnn=0; nnn<arrayLength; nnn++){
		if($(datesArray[nnn]).val()!=""){
			if($(datesArray[nnn]).val().indexOf("pm")>-1){
				selectedTime=parseInt($(datesArray[nnn]).val().substr(11,2))+(parseInt($(datesArray[nnn]).val().substr(11,2))!=12 ? 12:0);
				selectedTime=selectedTime+$(datesArray[nnn]).val().substring($(datesArray[nnn]).val().indexOf(":"),$(datesArray[nnn]).val().indexOf("pm")-1)+":00";
				selectedTime=$(datesArray[nnn]).val().substring(0,10)+" "+selectedTime;
			}
			else{
				if(parseInt($(datesArray[nnn]).val().substr(11,2))!=12){
					selectedTime=$(datesArray[nnn]).val().substring(0,$(datesArray[nnn]).val().indexOf("am")-1)+":00";
				}
				else{
					selectedTime="00"+$(datesArray[nnn]).val().substring($(datesArray[nnn]).val().indexOf(":"),$(datesArray[nnn]).val().indexOf("am")-1)+":00";
					selectedTime=$(datesArray[nnn]).val().substring(0,10)+" "+selectedTime;
				}
			}
			datesArray[nnn]=new Date(selectedTime);	
			datesArray[nnn]=(datesArray[nnn].getTime())/1000;
		}
		else{
			datesArray[nnn]=0;	
		}
	}
	return datesArray;	
}
function autoCompleteAssignee(){
	$('#assignee').autocomplete({ source: function (req,add){
		var personToAssignTo=$('#assignee').val();
		$.getJSON("GetUsersForAssignment.php?q="+personToAssignTo, function(data) {  
			//create array for response objects  
			var suggestions = [];  
			//process response  
			if(data!=null){
				$.each(data, function(i, val){
					suggestions.push(val);
				});
				add(suggestions);}
			});	
		},select:function(e,ui)	{
			if($("#emailReminder").length==0){
				$("#dtReminder").parent("td").parent("tr").after("<tr><td></td><td style='text-align:right'>Send email reminder? <input type='checkbox' checked='checked' id='emailReminder' /></td></tr><tr><td></td><td style='text-align:right'>Send text reminder? <input type='checkbox' id='textReminder' /></td></tr>");
			}
			$("#assignee").after("<span class='assigneeTag' id='"+ui.item.id+"'>"+ui.item.label+"<span class='removeAssignee' onclick='$(this).parent(\"span\").remove(); $(\"#assignee\").show();'>x</span></span>");
			$("#assignee").hide();
			return false;
		},delay:0,html:true
	});
}
function rightClickMenu(e){
	var thePieceLI=$("#"+$("#editPiece").attr("name"));
	$("body").append("<div id='editPieceOptionsMenu' style='top:"+((e.pageY)-20)+"px; left:"+e.pageX+"px;'><div class='contextMenuOption' onclick='$(\"#editPiece\").click()'>Edit piece</div><div class='contextMenuOption' onclick='$(\"#splitPiece\").click()'>Split piece</div><div class='contextMenuOption' onclick='$(\"#suggestChildren\").click(); clipboard();'>Suggest children</div><div class='contextMenuOption' onclick='$(\"#movePiece\").click()'>"+($("#movePiece").text()=="Move this piece" ? "Move piece":"Place piece here")+"</div><div class='contextMenuOption'"+($("#deletePiece").length!=0 ? "onclick='$(\"#deletePiece\").click()'>Delete this piece":"onclick='$(\"#markSpam\").click()'>Mark as Spam")+"</div>"+(ProjectOwner==1 && $(thePieceLI).children("div:first").children(".pieceDescriptions").children("img").length==0 ? "<div class='contextMenuOption' onclick='assignment()'>Assign piece to user</div>":"")+($("#ProjectID").attr("data-private")==1 ? ($(thePieceLI).attr("data-bid")!=0 ? "<div class='contextMenuOption' style='margin-top:10px; display:inline-block; margin-left:5px;'>Offers</div><div class='contextMenuOption' onclick='viewBids()'>View Offers</div>":""):"<div class='contextMenuOption' style='margin-top:10px; display:inline-block; margin-left:5px;'>Offers</div><div class='contextMenuOption' onclick='placeBid()'>Make an offer</div>"+($(thePieceLI).attr("data-bid")!=0 ? "<div class='contextMenuOption' onclick='viewBids()'>View Offers</div>":"")+"<div class='contextMenuOption' onmouseover='clipboard();' style='margin-top:10px; display:inline-block; margin-left:5px;'>Vote on piece</div><div class='contextMenuOption' onclick='$(\"#voteUseful\").click()'>Useful</div><div onclick='$(\"#voteNotUseful\").click()' class='contextMenuOption'>Not useful</div><div onclick='$(\"#voteInnovative\").click()' class='contextMenuOption'>Innovative</div>")+($(thePieceLI).attr("data-tr")==0 && ProjectOwner==1 ? "<div class='contextMenuOption cMH'>Outsource Task</div><div class='contextMenuOption' onclick='newTrTask()'>Task Rabbit</div>":"")+"</div>");	
}
function recordAutoSavePieces(){
	if(autoSave){
		$.get("AjaxQueries.php?QueryNumber=35");
	}
	else{
		$.get("AjaxQueries.php?QueryNumber=36");
	}
}
function openCloseIWantTo(){
	$('#iWantToOptions').slideToggle(400);
	if($("#iwtImage").hasClass("iwtOpen")){
		$("#iwtImage").removeClass("iwtOpen").addClass("iwtClose");
	}
	else{
		$("#iwtImage").removeClass("iwtClose").addClass("iwtOpen");
	}
}
function infoText(textID){
	var bubblePos=$(".helpMark:eq("+(textID-1)+")").position();
	if($(".infoTextBubble").length!=0){
		if(textID!=$(".infoTextBubble").attr("id").substr(2)){
			$(".infoTextBubble").remove();
			$('#simplemodal-data').append("<div class='infoTextBubble' id='iT"+textID+"' style='left:"+(bubblePos.left+20)+"px; top:"+(bubblePos.top-40)+"px;'>"+$("#infoText"+textID).text()+"</div>");	
		}
		else{
			$(".infoTextBubble").remove();
		}
	}
	else{
		$('#simplemodal-data').append("<div class='infoTextBubble' id='iT"+textID+"' style='left:"+(bubblePos.left+20)+"px; top:"+(bubblePos.top-40)+"px;'>"+$("#infoText"+textID).text()+"</div>");
	}
}
function viewBids(onlyNear){
	$('body').append("<img src='images/ajax-loader.gif' height='100' width='100' class='loader' style='position:absolute; top:300px; left:42%;' />");
	$.get("GetBidsTr.php?"+($("#ProjectID").attr("data-private")==1 ? "Private=true&PieceDescription="+$("#"+$("#editPiece").attr("name")).children("div").children(".pieceDescriptions").text():"PieceID="+$("#editPiece").attr("name"))+(typeof onlyNear!="undefined" ? "&OnlyNear=1":""),function(data){
		$(".loader").remove();
		if($("#simplemodal-data").length>0){
			$("#simplemodal-data").empty().append(data);
		}
		else{
			$.modal(data,{focus:false,containerCss:{
						background:"#FFF",
						border:"1px solid #0D1333",
						height:"75%",
						width:"65%"	
						}
					});
		}
	}).error(function(){$(".loader").remove();});
}
function placeBid(){
	$('body').append("<img src='images/ajax-loader.gif' height='100' width='100' class='loader' style='position:absolute; top:300px; left:42%;' />");
	$.get("BidEntry.html",function(data){
		$.modal(data,{focus:false,containerCss:{
					background:"#FFF",
					border:"1px solid #0D1333",
					height:"350px",
					width:"605px"
					}
				});
		$(".loader").remove();
		uploadInitializer("BidPic","bidImage",300,300,0);
	}).error(function(){$(".loader").remove();});
}
function deleteAndClose(){
	if($("#tempImg").length!=0){
		$.ajax({
			url:"DeleteFile.php",
			data:"FileID="+$("#tempImg").attr("data-file"),
			method:"DELETE"
		})
	}	
	$.modal.close();
}
function uploadInitializer(formName,idOfDropZone,mWidth,mHeight,finishFunction){
	$('#'+formName).fileupload();
    $('#'+formName).fileupload('option', {
		maxFileSize: 3000000,
		acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
		dropZone: $("#"+idOfDropZone),
		autoUpload: true,
		process: [
			{
				action: 'load',
				fileTypes: /^image\/(gif|jpeg|png)$/,
				maxFileSize: 20000000 // 20MB
			},
			{
				action: 'resize',
				maxWidth: mWidth,
				maxHeight: mHeight
			},
			{
				action: 'save'
			}
		],
		done:function(e,data){
			switch(finishFunction){
				case 0: showBidPic(($(data.result[0].documentElement).length==0 ? data.result:$(data.result[0].documentElement).text()));
				break;
			}
		}
	});
	$('#'+formName).fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            'FileUploader/cors/result.html?%s'
        )
    );
}
function showBidPic(bidPicID){	
	if($("#tempImg").length!=0){
		$.ajax({
			url:"DeleteFile.php",
			data:"FileID="+$("#tempImg").attr("data-file"),
			method:"DELETE"
		});
		$("#tempImg").remove();
	}
	$.get("GetFile.php?FileID="+bidPicID,function(data){
		$("#bidImage").children(".cA").text("");
		$("#bidImage").prepend("<img style='margin-top:-40px; max-height:150px; max-width:150px;' data-file='"+bidPicID+"' id='tempImg' class='cImg'/>");
		$("#tempImg").attr("src",data).load(function(e) {
            if($("#tempImg").width()==150){
				$("#tempImg").css("margin-left","-10px");
			}
        });	
		$("#anImage").css("margin-top","-150px");
	});
}
function submitBid(){
	$(".bidError").remove();
	if($("#bidUnit").val().length>50){
		$("#bidUnit").after("<div class='bidError'>Offer unit should be less than 50 characters.</div>");
		return;
	}
	if($("#bidDesc").val().length>500){
		$("#bidDesc").after("<div class='bidError'>Offer unit should be less than 500 characters.</div>");
		return;
	}
	if(!/(^\$?(?!0,?\d)\d{1,3}(,?\d{3})*(\.\d\d)?)$/.test($("#bidAmount").val())){
		$("#bidAmount").after("<span class='bidError'>Offer amount is in the wrong format.</span>");
		return;
	}
	if(!/^[1-9][0-9]*$/.test($("#cTime").val())){
		$("#timeUnit").after("<span class='bidError'>Only numbers and no leading zeros please.</span>");
		return;
	}
	if(!/^[1-9][0-9]*$/.test($("#maxUnits").val()) && $("#maxUnits").val()!=""){
		$("#maxUnits").after("<span class='bidError'>Only numbers and no leading zeros please.</span>");
		return;
	}
	$('#simplemodal-data').css('opacity','0.5').append("<img src='images/ajax-loader.gif' height='100' width='100' class='loader' style='position:absolute; top:100px; left:42%;' />");
	$.post("AddNewBid.php","PieceID="+$("#editPiece").attr("name")+"&BidDescription="+encodeURIComponent($("#bidDesc").val())+"&BidUnit="+encodeURIComponent($("#bidUnit").val())+"&CompletionTime="+$("#cTime").val()+"&TimeUnit="+$("#timeUnit").val()+"&BidAmount="+$("#bidAmount").val()+"&MaxUnits="+$("#maxUnits").val()+($("#tempImg").length!=0 ? "&BidImage="+$("#tempImg").attr("data-file"):""),function(data){
		$("#simplemodal-data").empty().css("opacity","1.0").append("<div style='margin-top:100px; font-size:28px; text-align:center; width:100%;'>Offer Submitted</div>");
		$("#"+$("#editPiece").attr("name")).attr("data-bid",1);
		setTimeout("$.modal.close();",500);
	}).error(function(){$(".loader").remove(); $('#simplemodal-data').css('opacity','1.0'); $("#bidSubmit").before("<div class='bidError'>Error processing, please resubmit.</div>");});
}
function acceptBid(bidID){
	$(".bidError,#infoPrompt").remove();
	if($("#extraInstructions"+bidID).length==0){
		$("#acceptBid"+bidID).before("<div id='removeOnAccept'><div class='boldMe mt10'>Extra instructions for seller:</div><div><textarea id='extraInstructions"+bidID+"' cols='25' rows='3'></textarea></div><div class='boldMe'>Quantity to purchase: <input type='text' id='purchaseQuantity"+bidID+"' style='width:13%;' /></div><div class='boldMe'>Allow seller to contact me by:</div><div>Phone: <input type='checkbox' id='phoneContact' /> Mail: <input type='checkbox' id='addressContact' /> Email: <input type='checkbox' id='emailContact' /></div>"+(ProjectOwner==1 ? "<div class='panelButtons w74' style='margin:10px 0 10px 0;' id='assign"+bidID+"' onclick='assignment("+bidID+")'>Add due date/reminder?</div>":"")+"</div>");
	}
	else{
		if(!/^[1-9][0-9]*$/.test($("#purchaseQuantity"+bidID).val())){
			$("#acceptBid"+bidID).after("<span class='bidError'>Only numbers and no leading zeros please.</span>");
			return;
		}
		if($("#extraInstructions"+bidID).val().length>500){
			$("#acceptBid"+bidID).after("<span class='bidError'>Please keep special instructions below 500 characters.</span>");
			return;
		}
		if(parseInt($("#unitsAvail"+bidID).text())-$("#purchaseQuantity"+bidID).val()<0 && $("#unitsAvail"+bidID).text()!="Unlimited"){
			$("#acceptBid"+bidID).after("<span class='bidError'>Quantity higher than units available.</span>");
			return;
		}
		if($("#dt"+bidID).length>0){
			var assignmentArray=createDatesArray(new Array("#dt"+bidID,"#dtReminder"+bidID));
			var assignmentString="&"+(assignmentArray[0] ? "dueDate="+assignmentArray[0]:"")+(assignmentArray[1] ? "&reminderDate="+assignmentArray[1]:"")+($("#textReminder"+bidID+":checked").length>0 ? "&textReminder=1":"")+($("#emailReminder"+bidID+":checked").length>0 ? "&emailReminder=1":"")+"&pieceID="+$("#editPiece").attr("name")+($("#ProjectID").attr("data-private")==1 ? "&ProjectID="+document.getElementById("ProjectID").value+"&Private=true":"");
		}
		$('#simplemodal-data').css('opacity','0.5').append("<img src='images/ajax-loader.gif' height='100' width='100' class='loader' style='position:absolute; top:100px; left:42%;' />");
		$.post("AcceptBid.php","Quantity="+$("#purchaseQuantity"+bidID).val()+"&Message="+encodeURIComponent($("#extraInstructions"+bidID).val())+"&BidID="+bidID+"&Phone="+$("#phoneContact").is(":checked")+"&Address="+$("#addressContact").is(":checked")+"&Email="+$("#emailContact").is(":checked")+assignmentString,function(data){
			var message="";
			$('#simplemodal-data').css('opacity','1.0');
			if(data==""){
				message="We've notified the seller of your acceptance of their offer. We'll send you a notification when the purchase is approved or rejected.";
			}
			else{
				data=parseInt(data);
				switch(data){
					case 1: message="Your phone number and address aren't set. Please update these";
					break;
					case 2: message="You don't have a phone number on file. Please update this";
					break;
					case 3: message="You don't have an address on file. Please update this";
					break;
				}
				message+=" in <a href='MyProfile.php?EditAccount' class='pseudoLink'>your account settings</a>. Otherwise, the seller won't be able to contact you.";
			}
			$(".loader").remove();
			$("#simplemodal-data").empty().append("<img src='images/X_Button.png' class='simple-modal-close' onClick='$.modal.close()' /><div style='margin-top:100px; font-size:28px; text-align:center; width:100%;'>"+message+"<div class='panelButtons' style='margin:20px auto;' onclick='$.modal.close()'>Close</div></div>");
			delete(message);
		}).error(function(){$(".loader").remove(); $("#bidSubmit").before("<div class='bidError'>Error processing, please resubmit.</div>");});
	}
}
function addUser(privateOrLocked){
	switch(privateOrLocked){
		case 1: var inputField="privateUsername"; var getUsers="GetUsersForAssignment"; var makeChange="privateProjectUser";
		break;
		case 2: var inputField="lockedUsername"; var getUsers="GetAllUsers"; var makeChange="LockedProjectChanges";
		break;
	}
	$('#'+inputField).autocomplete({ source: function (req,add){
		var userToAdd=$('#'+inputField).val();
		$.getJSON(getUsers+'.php?q='+userToAdd, function(data) {  
			var suggestions = [];  
			if(data!=null){
				$.each(data, function(i, val){
					suggestions.push(val);
				});
				add(suggestions);}
			});	
		},select:function(e,ui)	{
			$('#'+inputField).after("<span class='privateUserTag' id='"+ui.item.id+"'>"+ui.item.label+"<span class='removeUserFromProject' onclick='$.get(\""+makeChange+".php?Remove=1&UserID="+ui.item.id+"&ProjectID="+ProjectID+"\"); $(this).parent(\"span\").remove();'>x</span></span>");
			$.get(makeChange+'.php?Add=1&UserID='+ui.item.id+'&ProjectID='+ProjectID);
			$('#'+inputField).val('');
			return false;
		},delay:0,html:true
	});
}
function lockProject(){
	$.get("LockedProjectChanges.php?LockProject="+ProjectID);
	if($("#addPrivateUser").length==0){
		$("#theStatus").after("<div class='projInfo' id='addPrivateUser'>Add users to project: <input type='text' id='lockedUsername' /><br /></div>");
	}
	else{
		$("#addPrivateUser").show();
	}
	$("#unlockedProject").after("<span class='pseudoLink' onmouseover='$(this).text(\"Unlock\");' onmouseout='$(this).text(\"Locked\")' onclick='unlockProject()' id='lockedProject'>Locked</span>");
	$("#unlockedProject").remove();
	addUser(2);
}
function unlockProject(){
	$.get("LockedProjectChanges.php?UnlockProject="+ProjectID);
	$("#lockedProject").after("<span class='pseudoLink' onclick='lockProject()' onmouseover='$(this).text(\"Lock\");' onmouseout='$(this).text(\"Unlocked\")' id='unlockedProject'>Unlocked</span>");
	$("#lockedProject").remove();
	$("#addPrivateUser").hide();
}
function selectFirstInput(theInput){
	if(theInput.value=="Type Project Headline Here") {
		theInput.value="";
		$("body").append("<div id='helpfulTip' style='left: "+($(theInput).offset().left+$(theInput).width()+10)+"px; top:"+($(theInput).offset().top-20)+"px;'>After typing in the headline, hit enter and click on the save icon to start the project.</div>");
	}	
}
function newTrTask(){
	$("#assignmentType").change(function(e) {
        if($(this).val()=="review"){
			$("#willingPrice").hide();
		}
		else{
			$("#willingPrice").show();
		}
    });
	taskString="<table id='trProjInfo' class='w100'><img src='images/X_Button.png' onclick='closePictureModal()' class='simple-modal-close' />";
	if($("#isTrAuthed").val()!="1"){
		authWindow=window.open("https://taskrabbitdev.com/api/authorize?client_id=Pvlqzw3cyQI9cHdqlIaXrJQUHUixpytODuHwIOpN&response_type=code","","width=500,height=500,scrollbars=1");
		taskString+="<div class='bigText w100'>Please authorize TaskRabbit in the popup window</div>";
		$("#isTrAuthed").val("1");
	}
	$("#trProjInfo").remove();
	$("#trCost,#named_price").spinner({
		min: 0,
		step: 1,
		numberFormat: "C"
	});
	var pieceID=$("#deletePiece").attr("name");
	taskString+="<tr><td class='w200px'>Project Name:</td><td class='w200px'><input type='text' value='"+$("#"+pieceID).children(".textHolder").children(".pieceDescriptions").text()+"' id='projectName' /></td></tr><tr><td class='w200px'>Project specifications:</td><td class='w200px fRight'><textarea id='projectSpecs'>";
	$("#"+pieceID).children("ol").children("li").each(function(index, element) {
        taskString+=$(element).children(".textHolder").children(".pieceDescriptions").text()+"\n";
    });
	taskString+="</textarea></td></tr></table>";
	$("#trOptions").before(taskString);
	$("#dtTr").datetimepicker({ampm:true,minDate:0});
	$("#newTrTaskInfo").modal({focus:false});
}
function submitTrTask(){
	$(".bidError").remove();
	$("body").append("<img src='images/ajax-loader.gif' height='100' width='100' class='loader loader-modal' />");
	$(".simplemodal-data").css("opacity","0.5");
	finishTime=createDatesArray(new Array("#dtTr"));
	if($("#projectName").val()=="" || $("#projectSpecs").val()=="" || $("#named_price").val()=="$0.00" || $("#dtTr").val()==""){
		$("#trTask").before("<div class='bidError fRight'>Missing or inaccurate form data</div>");
		return;
	}
	$.post("TaskRabbit/NewTask.php",{"projectname":encodeURIComponent($("#projectName").val()),"specs":encodeURIComponent($("#projectSpecs").val()),"city":$("#trCity").val(),"cost":$("#trCost").val(),"named_price":$("#named_price").val(),"dueDate":finishTime[0],"assigneeID":$("#assigneeTr").val(),"assignment_type":$("#assignmentType").val(),"pieceID":$("#deletePiece").attr("name")},function(data){
		try{
			data=$.parseJSON(data);
			if(typeof data.AuthUrl!="undefined"){
				$("#trTask").removeAttr("onclick");
				$("#trTask").click(function(){
					authWindow=window.open(data.AuthUrl,"","width=500");	
				});
				$("#simplemodal-container").css("opacity","1");
				$(".loader").remove();
				$("#trTask").val("Please click to authorize");
			}
		}
		catch(e){
			$.modal.close();
			$(".loader").remove();
			$("#"+$("#deletePiece").attr("name")).attr("data-tr",1).attr("data-bid",1);			
		}
	});	
}
window.onhashchange=function(){
	windowHash=window.location.hash;
	if(backForwardButton){
		if(windowHash.substr(windowHash.indexOf("Piece")+6)=="" || windowHash.indexOf("Piece")==-1){
			var onclickAttr=$("#topLevelPiece").attr("onclick");
			upBranch(onclickAttr.substring(9,onclickAttr.indexOf(")")));
		}
		else{
			if($("li#"+windowHash.substr(12)).length>0){
				if(windowHash.indexOf("/")==-1){
					downBranch("branchDown"+windowHash.substring(12));
				}
				else{
					downBranch("branchDown"+windowHash.substring(12,windowHash.indexOf("/")));
				}
				backForwardButton=true;
			}
			else{
				if(windowHash.indexOf("/")==-1){
					upBranch(windowHash.substring(12));				
				}
				else{
					upBranch(windowHash.substring(12,windowHash.indexOf("/")));	
				}
				backForwardButton=true;
			}
		}
	}
	else{
		backForwardButton=true;
	}
};
function growLI(liNum){
	var os=$("#"+liNum).offset();
	if(!($("#"+liNum).hasClass("left") || $("#"+liNum).hasClass("right"))){
		$("#"+liNum).addClass("selectBox");	
	}
	$("#"+liNum).data("origHeight",$("#"+liNum).height());
	$("#"+liNum).append($("#pieceOptions1"));
$("#"+liNum).css("max-width","none").animate({marginLeft:"-="+os.left,height:window.innerHeight,width:window.innerWidth,marginTop:"-="+os.top},1000);
}
function shrinkLI(liNum){
	$("#"+liNum).animate({marginLeft:0,marginTop:0,width:"90%",height:$("#"+liNum).data("origHeight")},1000);
	$("body").append($("#pieceOptions1"));
}