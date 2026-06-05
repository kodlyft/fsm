import type { CapacitorConfig } from "@capacitor/cli";

// Brand values mirror the design tokens (brand #1D9E75, brand-900 #04342C).
const config: CapacitorConfig = {
	appId: "com.kodlyft.fsm",
	appName: "KodLyft FSM",
	webDir: "dist",
	server: {
		androidScheme: "https",
		iosScheme: "https",
	},
	plugins: {
		SplashScreen: {
			launchAutoHide: false,
			backgroundColor: "#04342C",
			showSpinner: false,
			splashFullScreen: true,
			splashImmersive: true,
		},
		StatusBar: {
			style: "LIGHT",
			backgroundColor: "#0F6E56",
		},
		Keyboard: {
			resize: "body",
		},
		PushNotifications: {
			presentationOptions: ["badge", "sound", "alert"],
		},
		LocalNotifications: {
			smallIcon: "ic_stat_notification",
			iconColor: "#1D9E75",
		},
	},
	android: {
		backgroundColor: "#04342C",
	},
	ios: {
		backgroundColor: "#04342C",
		contentInset: "automatic",
	},
};

export default config;
