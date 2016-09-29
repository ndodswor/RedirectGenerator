function testURL(myURL)
{
	if(window.location.href.indexOf(myURL) == -1)
	{
		return 0;
	}
	else
	{
		return 1;
	}
}

function DM_redirect_conditional(MobileURL, Home, URLToTest, isExclusive)
{
	try
	{
		var shouldRedirect = 0;
		if(isExclusive !== true)
		{
			isExclusive = false;
		}
        if(typeof URLToTest === 'string')
        {
        	shouldRedirect = testURL(URLToTest);
        }
        else
        {
	    	for(gix = 0; gix <= URLToTest.length; gix++)
	    	{
				shouldRedirect = shouldRedirect + testURL(URLToTest[gix]);
			}
		}
		if(isExclusive == false && shouldRedirect == 0 || 
			isExclusive == true && shouldRedirect != 0 || 
			URLToTest == undefined)
		{
			// avoid loops within mobile site
			if(document.getElementById("dmRoot") != null)
			{
				return;
			}
			var CurrentUrl = location.href
			var noredirect = document.location.search;
			if (noredirect.indexOf("no_redirect=true") < 0)
			{
				if ((navigator.userAgent.match(/(iPhone|iPod|BlackBerry|Android.*Mobile|BB10.*Mobile|webOS|Windows CE|IEMobile|Opera Mini|Opera Mobi|HTC|LG-|LGE|SAMSUNG|Samsung|SEC-SGH|Symbian|Nokia|PlayStation|PLAYSTATION|Nintendo DSi)/i)) ) 
				{
					if(Home)
					{
						location.replace(MobileURL);
					}
					else
					{
						location.replace(MobileURL + "?url=" + encodeURIComponent(CurrentUrl));
					}
				}
			}
		}			
	}
	catch(err){}	
}