const path = require('path');
const fs = require('fs');
const vscode = require('vscode');
const diff = require('semver/functions/diff');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	this.extensionName = 'bxvd.vt320';
	this.cntx = context;
	this.extension = vscode.extensions.getExtension(this.extensionName);

	if (this.extension) {

		// grab current version number
		this.version = this.extension.packageJSON.version;

		context.globalState.update(`${this.extensionName}.version`, this.version);
	}
	
	const config = vscode.workspace.getConfiguration("vt320");

	let disableGlow = config && config.disableGlow ? !!config.disableGlow : false;
	
	let brightness = parseFloat(config.brightness) > 1 ? 1 : parseFloat(config.brightness);
	brightness = brightness < 0 ? 0 : brightness;
	brightness = isNaN(brightness) ? 0.45 : brightness;

	const parsedBrightness = Math.floor(brightness * 255).toString(16).toUpperCase();
	let glowBrightness = parsedBrightness;

	let disposable = vscode.commands.registerCommand('vt320.enableGlow', function () {

		const isWin = /^win/.test(process.platform);
		const appDir = path.dirname(require.main.filename);
		const base = appDir + (isWin ? "\\vs\\code" : "/vs/code");

		const htmlFile =
			base +
			(isWin
				? "\\electron-browser\\workbench\\workbench.html"
				: "/electron-browser/workbench/workbench.html");

		const templateFile =
				base +
				(isWin
					? "\\electron-browser\\workbench\\phosphorglow.js"
					: "/electron-browser/workbench/phosphorglow.js");

		try {

			// generate production theme JS
			const chromeStyles = fs.readFileSync(__dirname +'/css/editor_chrome.css', 'utf-8');
			const jsTemplate = fs.readFileSync(__dirname +'/js/theme_template.js', 'utf-8');
			const themeWithGlow = jsTemplate.replace(/\[DISABLE_GLOW\]/g, disableGlow);
			const themeWithChrome = themeWithGlow.replace(/\[CHROME_STYLES\]/g, chromeStyles);
			const finalTheme = themeWithChrome.replace(/\[GLOW_BRIGHTNESS\]/g, glowBrightness);
			fs.writeFileSync(templateFile, finalTheme, "utf-8");
			
			// modify workbench html
			const html = fs.readFileSync(htmlFile, "utf-8");

			// check if the tag is already there
			const isEnabled = html.includes("phosphorglow.js");

			if (!isEnabled) {

				// delete script tag if there
				let output = html.replace(/^.*(<!-- DT320 --><script src="phosphorglow.js"><\/script><!-- PHOSPHOR GLOW -->).*\n?/mg, '');

				// add script tag
				output = html.replace(/\<\/html\>/g, `	<!-- DT320 --><script src="phosphorglow.js"></script><!-- PHOSPHOR GLOW -->\n`);
				output += '</html>';
	
				fs.writeFileSync(htmlFile, output, "utf-8");
				
				vscode.window
					.showInformationMessage("Glow enabled. VS code must reload for this change to take effect. Code may display a warning that it is corrupted, this is normal. You can dismiss this message by choosing 'Don't show this again' on the notification.", { title: "Restart editor to complete" })
					.then(function(msg) {
						vscode.commands.executeCommand("workbench.action.reloadWindow");
					});

			} else {
				vscode.window
					.showInformationMessage('Glow is already enabled. Reload to refresh JS settings.', { title: "Restart editor to refresh settings" })
					.then(function(msg) {
						vscode.commands.executeCommand("workbench.action.reloadWindow");
					});
			}
		} catch (e) {
			if (/ENOENT|EACCES|EPERM/.test(e.code)) {
				vscode.window.showInformationMessage("You must run VS code with admin priviliges in order to enable glow.");
				return;
			} else {
				vscode.window.showErrorMessage('Something went wrong when starting glow.');
				return;
			}
		}
	});

	let disable = vscode.commands.registerCommand('vt320.disableGlow', uninstall);
	
	context.subscriptions.push(disposable);
	context.subscriptions.push(disable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
	// ...
}

function uninstall() {
	var isWin = /^win/.test(process.platform);
	var appDir = path.dirname(require.main.filename);
	var base = appDir + (isWin ? "\\vs\\code" : "/vs/code");
	var htmlFile =
		base +
		(isWin
			? "\\electron-browser\\workbench\\workbench.html"
			: "/electron-browser/workbench/workbench.html");

	// modify workbench html
	const html = fs.readFileSync(htmlFile, "utf-8");

	// check if the tag is already there
	const isEnabled = html.includes("phosphorglow.js");

	if (isEnabled) {
		// delete synthwave script tag if there
		let output = html.replace(/^.*(<!-- DT320 --><script src="phosphorglow.js"><\/script><!-- DT320 -->).*\n?/mg, '');
		fs.writeFileSync(htmlFile, output, "utf-8");

		vscode.window
			.showInformationMessage("Glow disabled. VS code must reload for this change to take effect", { title: "Restart editor to complete" })
			.then(function(msg) {
				vscode.commands.executeCommand("workbench.action.reloadWindow");
			});
	} else {
		vscode.window.showInformationMessage('Glow isn\'t running.');
	}
}

module.exports = {
	activate,
	deactivate
}
