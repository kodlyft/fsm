/**
 * Conventional Commits for KodLyft FSM.
 * Enforced on every commit via the husky `commit-msg` hook and in CI.
 * https://www.conventionalcommits.org
 */
export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			[
				"feat", // a new feature
				"fix", // a bug fix
				"docs", // documentation only
				"style", // formatting, no code change
				"refactor", // neither fixes a bug nor adds a feature
				"perf", // performance improvement
				"test", // adding or fixing tests
				"build", // build system or dependencies
				"ci", // CI configuration
				"chore", // other changes that don't modify src or test
				"revert", // reverts a previous commit
			],
		],
		"scope-enum": [
			1,
			"always",
			[
				"design",
				"ui",
				"api",
				"console",
				"portal",
				"mobile",
				"backend",
				"deps",
				"release",
				"repo",
			],
		],
		"subject-case": [0],
		"body-max-line-length": [0],
		"footer-max-line-length": [0],
	},
};
