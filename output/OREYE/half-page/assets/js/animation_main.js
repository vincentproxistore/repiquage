"use strict";function overHandler(){if(bannerEnd&&rollover&&(rollover=!1,!1==checkrollover)){checkrollover=!0;var tl=new TimelineMax;tl.to("#cta .arrow",.2,{x:5,ease:Power2.easeIn},""),tl.to("#cta .arrow",.2,{x:0,ease:Power2.easeOut},"+=0.2"),"300x250"===bannerSize?(tl.to(blue_mask,1,{y:300,ease:Power2.easeIn}),tl.to(["#cta","#f2_logo"],1,{alpha:0,ease:Power2.easeIn},"-=1.5"),tl.set([blue_mask],{y:-250,onComplete:function onComplete(){bannerEnd=!1,startReAnim()}})):"300x600"===bannerSize?(tl.to(blue_mask,1,{y:650,ease:Power2.easeIn}),tl.to(["#cta","#f2_logo"],1,{alpha:0,ease:Power2.easeIn},"-=1.5"),tl.set([blue_mask],{y:-600,onComplete:function onComplete(){bannerEnd=!1,startReAnim()}})):"970x250"===bannerSize?(tl.to(blue_mask,1,{x:1100,ease:Power2.easeIn}),tl.to(["#f2_logo"],1,{alpha:0,ease:Power2.easeIn},"-=1.8"),tl.set([blue_mask],{x:-970,onComplete:function onComplete(){bannerEnd=!1,startReAnim()}})):void 0,tl.call(function(){return checkrollover=!1})}}function outHandler(){bannerEnd&&(rollover=!0)}