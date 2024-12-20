<script>
    import Button from '../common/components/button.svelte';
    import { getVideoDirectory, runFfmpeg } from '../services/command.service.js';
    import Input from "../common/components/input.svelte";
    import Textarea from "../common/components/textarea.svelte";
    import { DirectoryEnum } from '../enums/DirectoryEnum.svelte';

    let videoDirectory;
    let speedFactor = 1;
    let zoomFactor = 1;
    let outputWidth = 1920;
    let outputHeight = 1080;
    let preset = 'fast';
    let outputDirectory;
    let inputFiles;
    let concatValue;
        
    const handleRunFfmpeg = async () => {
        // Pass the required parameters for video processing to runFfmpeg function
        for (const script of dataSource) {
            console.log('script:::', script.episodes);
            const episodeFiles = gatherEpisodes(script.episodes);
            console.log('script.episodes:::', episodeFiles);

            videoDirectory = script.input;
            outputDirectory = script.output;
            concatValue = episodeFiles.length;
            inputFiles = generateInputFilesString(videoDirectory, episodeFiles)

            console.log('videoFiles:::', inputFiles);
            if (videoDirectory !== undefined && outputDirectory !== undefined) {
                const result = await runFfmpeg({
                    outputWidth: outputWidth,
                    outputHeight: outputHeight,
                    speedFactor: speedFactor,
                    zoomFactor: zoomFactor,
                    preset: preset,
                    inputFiles: inputFiles,
                    outputFile: `${outputDirectory}\\${episodeFiles[0]}`,
                    concatValue: concatValue,
                    libx264Preset: 'fast', // Assuming 'medium' preset
                    libx264Profile: 'main', // Assuming 'main' profile
                    videoBitrate: '15M', // Assuming bitrate
                    maxBitrate: '15M', // Assuming max bitrate
                    bufsize: '20M' // Assuming buffer size
                });

                console.log('is rendering:::');
                console.log('result:::', result)
            }
        }
    };

    /**
     * 
     * @param typeDirectory number
     * @param index number
     */
    let handleGetVideoDirectory = async (typeDirectory, index)  => {
        const data  = await getVideoDirectory();
        typeDirectory === DirectoryEnum.INPUT ? dataSource[index].input = data : dataSource[index].output = data;
    };

    /**
     * 
     * @param videos string[]
     */
    const generateInputFilesString = (videoDirectory, videos) => {
        const inputFiles = videos.map(video => `${videoDirectory}\\${video}`);
        console.log('inputFiles:::', inputFiles);

        return inputFiles;
    };
    
    /**
     * 
     * @param data string[]
     */
    const gatherEpisodes = (episode) => {
        // Regular expression to match file name patterns (assuming file names are alphanumeric with underscores)
        const fileNameRegex = /\b\w+(?:_\w+)*\b/g;
            
        const fileNames = episode.match(fileNameRegex);        
        // Add '.mp4' to each filename
        const fileNamesWithExtension = fileNames.map(fileName => fileName + '.mp4');
            
        return fileNamesWithExtension || [];
    }

    let dataSource = [{
        input: '',
        output: '',
        episodes: ''
    }];

    const addRows = () => {
        dataSource = [...dataSource, { input: '', output: '', episodes: '' }]; // Add a new row with default values
    }
</script>

<main>
    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>Vị trí Input</th>
                    <th>Vị trí Output</th>
                    <th>Số tập ghi chép</th>
                </tr>
            </thead>
            <tbody>
                {#each dataSource as item, i}
                    <tr>
                        <td align="center"> 
                            <Button on:click={() => handleGetVideoDirectory(DirectoryEnum.INPUT, i)}>Select</Button>
                            <Input label='Input' id={'input-' + 1} bind:value={item.input}/>
                        </td>
                        <td align="center">
                            <Button on:click={() => handleGetVideoDirectory(DirectoryEnum.OUTPUT, i)}>Select</Button>
                            <Input label='Output' id={'output' + 1} bind:value={item.output}/></td>
                        <!-- <td><Input type='number' bind:value={item.recordings} /></td> -->
                        <td><Textarea placeholder='Enter episodes...' rows='4' cols='60' bind:value={item.episodes} /></td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div>
        <div>
            <Button on:click={addRows}>Add row</Button>
        </div>
        <div>
            <Input label='Speed-up' id='speedFactor' type="number" bind:value={speedFactor} step="0.1" min="1" max="2" />
        </div>
        <div>
            <Input label='Zoom-in' id='zoomFactor' type="number" bind:value={zoomFactor} step="0.1" min="1" max="2" />
        </div>
        <div>
            <!-- <Input type='number' bind:value={preset}/> -->
            <Button >Preset</Button>
         </div>
    </div>

    <div>
        <Button on:click={() => handleRunFfmpeg()}> Run</Button>
    </div>
</main>

<style>
    tr {
        background-color: red;
    }
    th, td {
        /* padding: 8px; */
        text-align: center;
        border: 1px solid #ddd;
        align-items: center;
    }

    th {
        position: sticky;
        top: 0;
        background-color: #f2f2f2;
    }
    td {
        background-color: #fff;
    }

    thead {
        background-color: #f2f2f2;
    }

    div {
        margin-bottom: 20px;
    }

    .table-wrapper {
        overflow: auto;
        min-height: 500px;
        max-height: 500px; /* Set max height for scroll */
    }
    
</style>