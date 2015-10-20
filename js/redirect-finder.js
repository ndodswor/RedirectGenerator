/*-----redirect finder---------
generates redirect scripts for
dudamobile sites
------------------------------*/

//encodes HTML
function htmlEscape(str) {
    'use strict';
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

//generates the correct redirect script for the boxes checked
function generateRedirect(url, desktopUrl, language, whitelabeled, cookies, frameBreaker, https){
    'use strict';
    //set base variables
    var finalScript = "";
    var javascript_template_script = '<script type="text/javascript" src="[SCRIPT_URL_PLACEHOLDER][SCRIPT_COOKIES_PLACEHOLDER].js"></script>' + '\n' +
                        '<script type="text/javascript">[FUNCTION_NAME_PLACEHOLDER]("http://[SITE_URL_PLACEHOLDER]");</script>';
      var full_javascript_template_script = '<script type="text/javascript">[COOKIES_ADDED_PLACEHOLDER] ' + '\n' +
                         'function [FUNCTION_NAME_PLACEHOLDER](MobileURL, Home){ ' + '\n' +
                         'try { ' + '\n' +
                         'if(document.getElementById("dmRoot") != null) ' + '\n' +
                         '{ ' + '\n' +
                         'return; ' + '\n' +
                         '} ' + '\n' +
                         'var CurrentUrl = location.href; ' + '\n' +
                         'var noredirect = document.location.search; ' + '\n' +
                         '[COOKIES_ADDED_PLACEHOLDER_START]' +
                         'if (noredirect.indexOf("no_redirect=true") < 0){ ' + '\n' +
                         'if ((navigator.userAgent.match(/(iPhone|iPod|BlackBerry|Android.*Mobile|BB10.*Mobile|webOS|Windows CE' + '\n' +
                         '|IEMobile|Opera Mini|Opera Mobi|HTC|LG-|LGE|SAMSUNG|Samsung|SEC-SGH|Symbian|Nokia|PlayStation|' + '\n' +
                         'PLAYSTATION|Nintendo DSi)/i)) ) { ' + '\n' +
                         'if(Home){ ' + '\n' +
                         'location.replace(MobileURL + "?utm_referrer=" + document.referrer); ' + '\n' +
                         '} ' + '\n' +
                         'else ' + '\n' +
                         '{ ' + '\n' +
                         'location.replace(MobileURL + "?url=" + encodeURIComponent(CurrentUrl) + "&utm_referrer=" + document.referrer); ' + '\n' +
                         '} ' + '\n' +
                         '} ' + '\n' +
                         '} ' + '\n' +
                         '} ' + '\n' +
                         '[COOKIES_ADDED_PLACEHOLDER_END]' +
                         'catch(err){} ' + '\n' +
                         '} ' + '\n' +
                         '</script> ' + '\n' +
                         '<script type="text/javascript">[FUNCTION_NAME_PLACEHOLDER]("http://[SITE_URL_PLACEHOLDER]");</script> ';
      var cookies_added_script = 'function DM_setCookie(cookieName,cookieValue,nSeconds) {' + '\n' +
                         'var today = new Date(); ' + '\n' +
                         'var expire = new Date(); ' + '\n' +
                         'if (nSeconds==null || nSeconds==0) nSeconds=1000; ' + '\n' +
                         'expire.setTime(today.getTime() + 1000*nSeconds); ' + '\n' +
                         'document.cookie = cookieName+"="+escape(cookieValue) ' + '\n' +
                         '+ ";expires="+expire.toGMTString() + ";path=/;"; ' + '\n' +
                         '} ';
    var cookies_added_placeholder_start = 'if(document.cookie.indexOf("dmNoRedirect") < 0) {' + '\n';
    var cookies_added_placeholder_end = '}' + '\n' + 
                         'else { ' + '\n' + 
                         'DM_setCookie("dmNoRedirect", "1", 60*60);' + '\n' +
                         '}' + '\n';
    var php_template_script = '<?php' + '\n' +
                        '$mobileDomain = "http://[SITE_URL_PLACEHOLDER]";' + '\n' +
                        '$no_redirect = @$_REQUEST[\'no_redirect\'];' + '\n' +
                        'if($no_redirect != "true")' + '\n' +
                        '{' + '\n' +
                            '$agent = @$_SERVER[\'HTTP_USER_AGENT\'];' + '\n' +
                            '@ini_set(\'default_socket_timeout\',1);' + '\n' +
                            '$handle = @fopen("http://mobile.[DUDAMOBILE_API_PLACEHOLDER].com/api/public/detect?ua=" . urlencode($agent), "r");' + '\n' +
                            '@stream_set_timeout($handle, 1);' + '\n' +
                            '$result = @fread ( $handle , 1 );' + '\n' +
                            '@fclose($handle);' + '\n' +
                            'if ($result == "y") {' + '\n' +
                                '$currenturl = "http://".$_SERVER[\'SERVER_NAME\'].$_SERVER[\'REQUEST_URI\'];' + '\n' +
                                '$mobileUrl = $mobileDomain ."?url=" .urlencode($currenturl);' + '\n' +
                                '$mobileUrl=$mobileUrl."&dm_redirected=true";' + '\n' +
                                'header("Location: ".$mobileUrl);' + '\n' +
                                'exit;' + '\n' +
                            '}' + '\n' +
                        '}' + '\n' +
                        '?>';
    var asp_template_script = '<%Dim no_redirect, detecturl, handle, output, currenturl, mobileUrl' + '\n' +
                        'no_redirect = Request.QueryString("no_redirect")' + '\n' +
                        'If no_redirect <> "true" Then' + '\n' +
                        'currenturl = ( "http://" & Request.ServerVariables("SERVER_NAME") & Request.ServerVariables("URL") ) & "?" & Request.ServerVariables("QUERY_STRING")' + '\n' +
                        'detecturl = "http://mobile.[DUDAMOBILE_API_PLACEHOLDER].com/api/public/detect?ua=" & Server.UrlEncode(Request.ServerVariables("HTTP_USER_AGENT"))' + '\n' +
                        'set handle = CreateObject("MSXML2.ServerXMLHTTP")' + '\n' +
                        'handle.setTimeouts 5000,5000,5000,5000' + '\n' +
                        'handle.open "GET", detecturl, false' + '\n' +
                        'handle.send ""' + '\n' +
                        'output = handle.responseText' + '\n' +
                        'mobileUrl = "http://[SITE_URL_PLACEHOLDER]" & "?url=" & Server.UrlEncode(currenturl) & "&dm_redirected=true"' + '\n' +
                        'If output = "y" Then' + '\n' +
                        'Response.Redirect(mobileUrl)' + '\n' +
                        'End If' + '\n' +
                        'End If' + '\n' +
                        '%>';
    var jsp_template_script = '<%@page import="java.net.URLEncoder"%>' + '\n' +
                        '<%@page import="java.net.URL"%>' + '\n' +
                        '<%@page import="java.net.HttpURLConnection"%>' + '\n' +
                        '<%' + '\n' +
                        'if(! "true".equals(request.getParameter("no_redirect")))' + '\n' +
                        '{' + '\n' +
                        'String currenturl = request.getRequestURL() + (request.getQueryString() != null ? "?" + request.getQueryString() : "");' + '\n' +
                        'try{' + '\n' +
                        'String ua = URLEncoder.encode(request.getHeader("user-agent"), "utf-8");' + '\n' +
                        'HttpURLConnection con = (HttpURLConnection)new URL("http://mobile.[DUDAMOBILE_API_PLACEHOLDER].com/api/public/detect?ua=" + ua).openConnection();' + '\n' +
                        'con.setConnectTimeout(5000);' + '\n' +
                        'char c = (char)con.getInputStream().read();' + '\n' +
                        'con.disconnect();' + '\n' +
                        'if(c == \'y\')' + '\n' +
                        '{' + '\n' +
                        'String mobileUrl = "http://[SITE_URL_PLACEHOLDER]";' + '\n' +
                        'response.sendRedirect(mobileUrl + "?url=" + URLEncoder.encode(currenturl) + "&dm_redirected=true");' + '\n' +
                        '}' + '\n' +
                        '}' + '\n' +
                        'catch(Exception e){' + '\n' +
                        'e.printStackTrace();' + '\n' +
                        '}' + '\n' +
                        '}' + '\n' +
                        '%>';
    var htaccess_template_script = 'RewriteEngine on' + '\n' +
                        '######### Set cookie for users who return to desktop site' + '\n' +
                        'RewriteBase /' + '\n' +
                        'RewriteCond %{QUERY_STRING} no_redirect=true [NC]' + '\n' +
                        'RewriteRule ^(.*)$ - [co=dm_show_classic:true:.[DESKTOP_SITE_URL_PLACEHOLDER]:7200:/]' + '\n' +
                        '# check no \'dm_show_classic\' cookie is set' + '\n' +
                        'RewriteCond %{HTTP_COOKIE} !dm_show_classic' + '\n' +
                        '# check if no_redirect was sent in the url' + '\n' +
                        'RewriteCond %{QUERY_STRING} !no_redirect=true [NC]' + '\n' +
                        '# check if the user agent matches supported mobile devices' + '\n' +
                        'RewriteCond %{HTTP_USER_AGENT} ((.*iPhone.*)|(.*iPod.*)|(.*BlackBerry.*)|(.*Android.*)|(.*webOS.*)|(.*Windows\ CE.*)|(.*IEMobile.*)|(.*Opera\ Mini.*)|(.*Opera\ Mobi.*)|(.*HTC.*)|(.*LG-.*)|(.*LGE.*)|(.*SAMSUNG.*)|(.*Samsung.*)|(.*Symbian.*)|(.*Nokia.*)|(.*PlayStation.*)|(.*PLAYSTATION.*)|(.*Nintendo\ DSi.*)|(.*TMO-US_LEO.*)|(.*SEC-SGH.*)|(.*BB10.*))' + '\n' +
                        '# check if the request isn\'t for a static file' + '\n' +
                        'RewriteCond %{REQUEST_FILENAME} !\.(jpg|gif|png|css|js|txt|ico|pdf|bmp|tif|mp3|wav|wma|asf|mp4|flv|mpg|avi|csv|doc|docx|xls|xlsx|ppt|pptx|zip|rar|tar|gz|dmg|iso)$ [NC]' + '\n' +
                        '#### If query string is not empty, then include ##############' + '\n' +
                        'RewriteCond %{QUERY_STRING} !^$' + '\n' +
                        '# extract the current page url including the query string' + '\n' +
                        'RewriteCond http://%{HTTP_HOST}%{REQUEST_URI}?%{QUERY_STRING} ^(.*)$' + '\n' +
                        '# redirect the request to mobile domain and pass the page url as a parameter' + '\n' +
                        'RewriteRule ^(.*)$ http://[SITE_URL_PLACEHOLDER]?url=%1 [R=302,L]';
    var script_url_placeholder = "http://static.dudamobile.com/DM_redirect";
    var script_cookies_placeholder = "";
    var function_name_placeholder = "DM_redirect";
    var dudamobile_api_placeholder = "dudamobile";

    //-------javascript settings-------
    if(language === 'javascript' || language === 'fullScript')
    {
        //show relevant options
        $('#cookiesDiv').show();
        $('#frameBreakDiv').show();
        $('#httpsDiv').show();
        $('#desktopUrlDiv').hide();
        //if cookies is checked, set the cookie variable
        if(cookies) {
            script_cookies_placeholder = "_cookie";
            if(whitelabeled && language !== 'fullScript') { //if whitelabeled and cookies but not full script, force full script
                $('#languageSelect').val('fullScript');
                alert('Javascript unavailable for this option combination. Reverting to Full Javascript.');
                return generateRedirect(url, desktopUrl, 'fullScript', whitelabeled, cookies, frameBreaker, https);
            }
        }
        //if framebreaker is set but full script is not, set full script.
        if(frameBreaker && language !== 'fullScript') {
            $('#languageSelect').val('fullScript');
            alert('Javascript unavailable for this option combination. Reverting to Full Javascript.');
            return generateRedirect(url, desktopUrl, 'fullScript', whitelabeled, cookies, frameBreaker, https);
        }
        //if https is checked, set the custom URLs for https
        if(https) {
            script_url_placeholder = "https://s3.amazonaws.com/static.dudamobile.com/DM_redirect";
            if(whitelabeled) { //if whitelabeled is also checked, set the whitelabel https url
                script_url_placeholder = "https://s3.amazonaws.com/static.mobilewebsiteserver.com/DM_redirect";
            }
        }
        else
        {    //if whitelabeled for non-https is checked, set the whitelabel custom url
            if(whitelabeled) {
                script_url_placeholder =  "http://static.mobilewebsiteserver.com/redirect";
                script_cookies_placeholder = "";
                function_name_placeholder = "Mobile_redirect";
            }
        }
        //if the full script is enabled
        if(language === 'fullScript')
        {
            //clear cookies script just in case
            if(whitelabeled)
            {
                function_name_placeholder = "Mobile_redirect";
            }
            if(cookies)
            {
                script_cookies_placeholder = cookies_added_script;
            }
            else
            {
                script_cookies_placeholder = "";
                cookies_added_placeholder_start = "";
                cookies_added_placeholder_end = "";
            }
            finalScript = full_javascript_template_script;
            finalScript = finalScript.replace(/\[FUNCTION_NAME_PLACEHOLDER\]/g, function_name_placeholder);
            finalScript = finalScript.replace(/\[COOKIES_ADDED_PLACEHOLDER\]/g, script_cookies_placeholder);
            finalScript = finalScript.replace(/\[COOKIES_ADDED_PLACEHOLDER_START\]/g, cookies_added_placeholder_start);
            finalScript = finalScript.replace(/\[COOKIES_ADDED_PLACEHOLDER_END\]/g, cookies_added_placeholder_end);
            if(frameBreaker)
            {
                finalScript = finalScript.replace(/location\.replace/g, 'top.location.replace');
            }
        }
        else
        {
            finalScript = javascript_template_script;
            finalScript = finalScript.replace(/\[FUNCTION_NAME_PLACEHOLDER\]/g, function_name_placeholder);
            finalScript = finalScript.replace(/\[SCRIPT_COOKIES_PLACEHOLDER\]/g, script_cookies_placeholder);
            finalScript = finalScript.replace(/\[SCRIPT_URL_PLACEHOLDER\]/g, script_url_placeholder);
        }
    }
    //-------Non-javascript settings-------
    if(language === 'asp' || language === 'jsp' || language === 'php' || language === 'htaccess')
    {
        //hide irrelevant options
        $('#cookiesDiv').hide();
        $('#frameBreakDiv').hide();
        $('#httpsDiv').hide();
        //get the appropriate language
        switch(language) {
        case 'asp':
            finalScript = asp_template_script;
            break;
        case 'jsp':
            finalScript = jsp_template_script;
            break;
        case 'htaccess':
            finalScript = htaccess_template_script;
            break;
        case 'php':
            finalScript = php_template_script;
            break;
        default:
            finalScript = 'Error: Invalid language selected.';
        }
        //set desktopURL parameters for .htaccess
        if(language === 'htaccess') {
            $('#desktopUrlDiv').show();
            finalScript = finalScript.replace(/\[DESKTOP_SITE_URL_PLACEHOLDER\]/g, desktopUrl);
        }
        else {
            $('#desktopUrlDiv').hide();
        }
        //set the API placeholder appropriately
        dudamobile_api_placeholder = "dudamobile";
        if(whitelabeled) {
            dudamobile_api_placeholder = "mobilewebsiteserver";
        }
        //replace the API placeholder
        finalScript = finalScript.replace(/\[DUDAMOBILE_API_PLACEHOLDER\]/g, dudamobile_api_placeholder);
    }
    //replace the URL and format the script for display
    finalScript = finalScript.replace(/\[SITE_URL_PLACEHOLDER\]/g, url);
    finalScript = htmlEscape(finalScript);
    finalScript = finalScript.replace(/\n/g, '<br>');
    return finalScript;
}

//Set up the button click on load
$(document).ready(function () {
    'use strict';
    //call function on page load
    $("#script").html(generateRedirect($('#URL').val(), 
        $('#desktopUrl').val(),
        $('#languageSelect').val(),
        $('#whitelabeled').is(':checked'), 
        $('#cookies').is(':checked'), 
        $('#frameBreak').is(':checked'), 
        $('#https').is(':checked')));
    $("#options").on('change', 'input',function() {
        console.log("Fetching script...");
        //Generate the redirect from the checked boxes
        $("#script").html(generateRedirect($('#URL').val(), 
        $('#desktopUrl').val(),
        $('#languageSelect').val(),
        $('#whitelabeled').is(':checked'), 
        $('#cookies').is(':checked'), 
        $('#frameBreak').is(':checked'), 
        $('#https').is(':checked')));
    });
    $("#options").on('change', 'select',function() {
        console.log("Fetching script...");
        //Generate the redirect from the checked boxes
        $("#script").html(generateRedirect($('#URL').val(), 
        $('#desktopUrl').val(),
        $('#languageSelect').val(),
        $('#whitelabeled').is(':checked'), 
        $('#cookies').is(':checked'), 
        $('#frameBreak').is(':checked'), 
        $('#https').is(':checked')));
    });
});