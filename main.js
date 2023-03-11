gsap.registerPlugin(TextPlugin, Observer, ScrollTrigger,CustomEase,EasePack, EaselPlugin);

/* --------------------------------FUNCTION HELPER START---------------------------- */ 
   function horizontalLoop(items, config) {
	items = gsap.utils.toArray(items);
	config = config || {};
	let tl = gsap.timeline({repeat: config.repeat, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
		length = items.length,
		startX = items[0].offsetLeft,
		times = [],
		widths = [],
		xPercents = [],
		curIndex = 0,
		pixelsPerSecond = (config.speed || 1) * 100,
		snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
		totalWidth, curX, distanceToStart, distanceToLoop, item, i;
	gsap.set(items, { // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
		xPercent: (i, el) => {
			let w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
			xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / w * 100 + gsap.getProperty(el, "xPercent"));
			return xPercents[i];
		}
	});
	gsap.set(items, {x: 0});
	totalWidth = items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX") + (parseFloat(config.paddingRight) || 0);
	for (i = 0; i < length; i++) {
		item = items[i];
		curX = xPercents[i] / 100 * widths[i];
		distanceToStart = item.offsetLeft + curX - startX;
		distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
		tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
		  .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
		  .add("label" + i, distanceToStart / pixelsPerSecond);
		times[i] = distanceToStart / pixelsPerSecond;
	}
	function toIndex(index, vars) {
		vars = vars || {};
		(Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length); // always go in the shortest direction
		let newIndex = gsap.utils.wrap(0, length, index),
			time = times[newIndex];
		if (time > tl.time() !== index > curIndex) { // if we're wrapping the timeline's playhead, make the proper adjustments
			vars.modifiers = {time: gsap.utils.wrap(0, tl.duration())};
			time += tl.duration() * (index > curIndex ? 1 : -1);
		}
		curIndex = newIndex;
		vars.overwrite = true;
		return tl.tweenTo(time, vars);
	}
	tl.next = vars => toIndex(curIndex+1, vars);
	tl.previous = vars => toIndex(curIndex-1, vars);
	tl.current = () => curIndex;
	tl.toIndex = (index, vars) => toIndex(index, vars);
	tl.times = times;
	tl.progress(1, true).progress(0, true); // pre-render for performance
	if (config.reversed) {
	  tl.vars.onReverseComplete();
	  tl.reverse();
	}
	return tl;
};
 

gsap.set([".greet","based-text", "based-img"], {autoAlpha:1});

/*-------------------GREETING------------------*/

var tl = gsap.timeline({repeat: 30, yoyo:true, repeatDelay:0.7, delay:2})
.from(".greet", {y : -180, stagger:1, ease :"back"})
.to(".greet", {y : 180, stagger:1},1)

/*-------------------NICKNAMES------------------*/

const nicknames = gsap.utils.toArray(".nickname");
const loop = horizontalLoop(nicknames, {repeat: -1,paddingRight: 7})
gsap.to(loop, {timeScale:-1, duration: 0.01, overwrite : true})
loop.play();

let mm = gsap.matchMedia();

/* -----------------------------------------------------------------------*/
/* --------------------------FOR DESKTOP----------------------------------*/
/* -----------------------------------------------------------------------*/

mm.add("(min-width:752px)", () => {

/*----------------------FRONTEND----------------------*/
let b = 0,
	timer,
	snap = gsap.utils.snap(0.01);

const frontEnd = gsap.timeline({paused:true})
.to(".content-cover-isme",{
	yPercent:100,
	ease: "power3.inOut",
	duration:.5
})
	.from (".is-text", {
		autoAlpha:snap,
		scale:0,
		transformOrigin:"center bottom",
		modifiers:{
			snap:b
		}
	},"<+0.2");
	Observer.create({
		target: ".trigger-frontend",
		onPress: function continueTick() {
			b +=0.7;
			timer = setTimeout(continueTick,200)
			frontEnd.play()
		},
		onRelease: function timeoutClear(){
			clearTimeout(timer)
			b = 0;
			frontEnd.reverse()
		}
	})

/*--------------------LOOKING-JOB----------------------*/
	let lookingJob = gsap.timeline({paused:true})
	.to(".content-cover-job", {
		xPercent:100,
		duration:2,
		ease:"back.inOut(2)"
	})
	.to(".aslay", {
		text:"just finished my bachelor's degree and currently looking for both  job and collaborative project", 
		duration:5, 
	});

	Observer.create({
		target:".job-trigger",
		onClick: () => lookingJob.play(),
		onStop: () => lookingJob.reverse(1.5),
		onStopDelay: 15,
	});

	/*----------------------------BASED CITY------------------------*/
	let basedCity = gsap.timeline({paused:true, defaults:{ duration:1}})
		.to(".content-cover-city", {yPercent:120, ease:"back.inOut(2)"})
		.to(".based-img", {autoAlpha:0, scale:0, transformOrigin:"center bottom", ease:"elastic.in(0.5,0.5)"},"<+0.5")
		.from(".based-text", {autoAlpha:0, scaleY:0, transformOrigin: "center bottom", ease:"elastic.out(1.1,0.4)"},);

		Observer.create({
			target: ".city-trigger",
			onClick: () => basedCity.play(),
			onStopDelay: 10,
			onStop: () => basedCity.reverse()
		})

		return ()=>{
			loop.restart()
		  }
	});

/* ---------------------------------------------------------------------------------*/
/* --------------------------------FOR MOBILE --------------------------------------*/
/* ---------------------------------------------------------------------------------*/

mm.add("(max-width:750px)", () => {

/*-------------------FRONTENDTRIGGER------------------*/
let a = 0,
	timer;
	snap = gsap.utils.snap(0.7)
	const isMe = gsap.timeline({paused:true})
	.to(".content-cover-isme",{
		xPercent:100,
		ease: "power3.inOut",
		duration:.5
	})
	.from(".is-text", {
		autoAlpha:a,
		scale:0,
		transformOrigin:"left center",
		ease:"power1.inOut",
		modifiers:{
			autoAlpha:snap
		}
	},"<+0.1")
Observer.create({
		target: ".press-and-hold",
		onPress: function continueTick() {
			a +=0.7;
			timer = setTimeout(continueTick,200)
			isMe.play()
		},
		onRelease: function timeoutClear(){
			clearTimeout(timer)
			a = 0;
			isMe.reverse()
		}
	})

	
/*--------------------LOOKING-JOB----------------------*/

	let lookingJob = gsap.timeline({paused:true})
	.to(".content-cover-job", {
		xPercent:100,
		duration:2,
		ease:"back.inOut(2)"
	})
	.to(".aslay", {
		text:"just finished my bachelor's degree and currently looking for both  job and collaborative project", 
		duration:5, 
	});  

	Observer.create({
		target:".job-trigger-mobile",
		onClick: () => lookingJob.play(),
		onStop: () => lookingJob.reverse(1.5),
		onStopDelay:15
	})

/*----------------------BASED CITY-----------------------*/

	let basedCity = gsap.timeline({paused:true, defaults:{ duration:1}})
		.to(".content-cover-city", {yPercent:120, ease:"back.inOut(2)"})
		.to(".based-img", {autoAlpha:0, scale:0, transformOrigin:"center bottom", ease:"elastic.in(0.5,0.5)"},"<+0.3")
		.from(".based-text", {autoAlpha:0, scaleY:0, transformOrigin: "center bottom", ease:"elastic.out(1.1,0.4)"},);

		Observer.create({
			target: ".city-trigger-mobile",
			onClick: () => basedCity.play(),
			onStopDelay: 10,
			onStop: () => basedCity.reverse()
		})
  return ()=>{
	loop.restart()
  }
}); 
/* ------------------------ end for mobile ----------------------------------------*/

