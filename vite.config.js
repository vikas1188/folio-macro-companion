import {defineConfig} from 'vite';
import {sites} from '@openai/sites-vite-plugin';
export default defineConfig({plugins:[sites()],publicDir:false,build:{outDir:'dist',emptyOutDir:true,lib:{entry:'server/worker.js',formats:['es'],fileName:()=> 'server/index.js'},minify:true}});
