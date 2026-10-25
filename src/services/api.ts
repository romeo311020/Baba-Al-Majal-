/** API boundary: connect a trusted sports provider here. Never put private API keys in browser code. */
export type ApiState<T> = { data:T; mode:'demo'; message:string };
export async function getDemoData<T>(data:T):Promise<ApiState<T>> { return {data,mode:'demo',message:'Demo data only. No live provider is configured.'}; }
export function getApiConfig(){return {sportsApiBaseUrl:import.meta.env.VITE_SPORTS_API_BASE_URL||'', assistantApiUrl:import.meta.env.VITE_ASSISTANT_API_URL||''};}
