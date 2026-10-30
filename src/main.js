if(new URLSearchParams(location.search).get('experience')==='animated')await import('./animated-main.js');
else await import('./static-main.js');
