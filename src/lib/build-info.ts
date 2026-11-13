/** Version, build number and commit of the running app (set at build time in vite.config.ts). */
export const buildInfo = __TENDWELL_BUILD__;

export const versionLabel = `v${buildInfo.version} (build ${buildInfo.number})`;
