export type FileKind = 'source'|'config'|'test'|'asset';
export interface RepoFile { path:string; sha:string; size:number; content?:string; language:string; kind:FileKind }
export interface SymbolInfo { name:string; kind:'function'|'class'|'component'|'export'; line:number }
export interface FileAnalysis extends RepoFile { imports:string[]; exports:string[]; symbols:SymbolInfo[]; complexity:number; warnings:string[] }
export interface GraphNode { id:string; label:string; path:string; group:string; degree:number; x:number; y:number }
export interface GraphEdge { source:string; target:string; type:'imports' }
export interface Analysis { files:FileAnalysis[]; nodes:GraphNode[]; edges:GraphEdge[]; languages:Record<string,number>; packages:string[]; entrypoints:string[]; warnings:string[]; stats:{files:number; lines:number; dependencies:number; averageComplexity:number} }
export interface AiReview { executiveSummary:string; architecture:{summary:string; confidence:'high'|'medium'|'low'; layers:string[]}; strengths:string[]; risks:{title:string;detail:string;severity:'low'|'medium'|'high'}[]; recommendations:string[]; onboarding:string[]; health:{maintainability:number;modularity:number;coupling:number;complexity:number;testability:number;security:number} }
