function playMusic()
{
	var media = document.getElementById("music");
	media.volume = .2;
	const playPromise = media.play();
	if (playPromise !== null){
		playPromise.catch(() => { media.play(); })
	}
}

function loading()
{
    document.getElementById("loading").style.display = "none";
};