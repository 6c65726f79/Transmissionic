package com.sleroy.transmissionic;

import android.content.res.Configuration;
import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;
import com.whitestein.securestorage.SecureStoragePlugin;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		registerPlugin(SecureStoragePlugin.class);
	}

	@Override
	public void onStart() {
		super.onStart();
		// Android fix for enabling dark mode
		int nightModeFlags = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
		WebSettings webSettings = this.bridge.getWebView().getSettings();
		if (nightModeFlags == Configuration.UI_MODE_NIGHT_YES) {
		  String userAgent = webSettings.getUserAgentString();
		  userAgent = userAgent + " AndroidDarkMode";
		  webSettings.setUserAgentString(userAgent);
		}
	}
}
