(function () {

  // Grab body node
  const bodyNode = document.querySelector('body');

  // Replace the styles with the glow theme
  const initGlow = (disableGlow, obs) => {
    var themeStyleTag = document.querySelector('.vscode-tokens-styles');

    if (!themeStyleTag) {
      return;
    }

    var initialThemeStyles = themeStyleTag.innerText;
    
    var updatedThemeStyles = initialThemeStyles;
    
    if (!disableGlow) {
      
      // Bold amber block
      updatedThemeStyles = updatedThemeStyles.replace(/color: #ffc039;/g, "color: #4d4d4d; background-color: #ffc039; box-shadow: 0 0 10px #FFB000; font-weight: bold;");

      // Bold amber
      updatedThemeStyles = updatedThemeStyles.replace(/color: #ffcd61;/g, "font-weight: bold; text-shadow: 0 0 10px #FFB000, 0 0 10px #FFB00055;");

      // Amber
      updatedThemeStyles = updatedThemeStyles.replace(/color: #ffcd60;/g, "text-shadow: 0 0 10px #FFB000, 0 0 10px #FFB00055;");

      // Light amber
      updatedThemeStyles = updatedThemeStyles.replace(/color: #ffe683;/g, "text-shadow: 0 0 10px #FFB000, 0 0 10px #FFB00055;");
      
      // Grey
      updatedThemeStyles = updatedThemeStyles.replace(/color: #888888;/g, "text-shadow: 0 0 10px #888;");
      
      // White
      updatedThemeStyles = updatedThemeStyles.replace(/color: #ffffff;/g, "text-shadow: 0 0 10px #fff, 0 0 10px #ffffff55;");
    }

    /* append the remaining styles */
    updatedThemeStyles = `${updatedThemeStyles}[CHROME_STYLES]`;

    const newStyleTag = document.createElement('style');
    newStyleTag.setAttribute("id", "vt320-theme-styles");
    newStyleTag.innerText = updatedThemeStyles.replace(/(\r\n|\n|\r)/gm, '');
    document.body.appendChild(newStyleTag);
    
    console.log('VT320: Phosphor Glow initialised!');
    
    // disconnect the observer because we don't need it anymore
    if (obs) {
      obs.disconnect();
    }
  };

  // Callback function to execute when mutations are observed
  const watchForBootstrap = function(mutationsList, observer) {
      for(let mutation of mutationsList) {
          if (mutation.type === 'attributes') {
            // only init if we're using a Synthwave 84 subtheme
            const isUsingVT320 = document.querySelector('[class*="bxvd-vt320-vscode-themes"]');
            // does the style div exist yet?
            const tokensLoaded = document.querySelector('.vscode-tokens-styles');
            // does it have content ?
            const tokenStyles = document.querySelector('.vscode-tokens-styles').innerText;

            // sometimes VS code takes a while to init the styles content, so stop this observer and add an observer for that
            if (isUsingVT320 && tokensLoaded) {
              observer.disconnect();
              observer.observe(tokensLoaded, { childList: true });
            }
          }
          if (mutation.type === 'childList') {
            const isUsingVT320= document.querySelector('[class*="bxvd-vt320-vscode-themes"]');
            const tokensLoaded = document.querySelector('.vscode-tokens-styles');
            const tokenStyles = document.querySelector('.vscode-tokens-styles').innerText;

            // Everything we need is ready, so initialise
            if (isUsingVT320 && tokensLoaded && tokenStyles) {
              initGlow([DISABLE_GLOW], observer);
            }
          }
      }
  };

  // try to initialise the theme
  initGlow([DISABLE_GLOW]);

  // Use a mutation observer to check when we can bootstrap the theme
  const observer = new MutationObserver(watchForBootstrap);
  observer.observe(bodyNode, { attributes: true });

})();