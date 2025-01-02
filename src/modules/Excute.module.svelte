<script>
    import Input from "../common/components/input.svelte";
    import Textarea from "../common/components/textarea.svelte";
    import Select from '../common/components/select.svelte';
    import Tooltip from '../common/components/tooltip.svelte';
    import { DirectoryEnum } from '../enums/DirectoryEnum.svelte';
    import { DispatchEnum } from '../enums/DispatchEnum.svelte';
    import { DispatchEventEnum } from '../enums/DispatchEventEnum.svelte';
    import { getVideoDirectory, getPackageAsDirectory, render } from '../services/command.service.js';
    import { FfmpegModel } from '../models/ffmpeg.model';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let videoDirectory;
    let speedFactor = 1;
    let zoomFactor = 1;
    let videoBitrate = 15;
    let outputWidth = 1920;
    let outputHeight = 1080;
    let preset = 'medium';
    let outputDirectory;
    let inputFiles;
    let concatValue;

    const handleRunFfmpeg = async () => {
        dispatch(DispatchEventEnum.IS_LOADING, DispatchEnum.TURN_ON);
        
        const renderPromises = []; // Array to hold the promises for concurrent rendering

        for (let i = 0; i < dataSource.length; i++) {
            const script = dataSource[i];
            const episodeFiles = gatherEpisodes(script.episodes);

            videoDirectory = script.input;
            outputDirectory = script.output;
            concatValue = episodeFiles.length;
            inputFiles = generateInputFilesString(videoDirectory, episodeFiles);

            if (videoDirectory !== undefined && outputDirectory !== undefined) {
                const ffmpeg = new FfmpegModel({
                    outputWidth: outputWidth,
                    outputHeight: outputHeight,
                    speedFactor: speedFactor,
                    zoomFactor: zoomFactor,
                    preset: preset,
                    inputFiles: inputFiles,
                    outputFile: `${outputDirectory}`,
                    concatValue: concatValue,
                    profile: 'main',
                    videoBitrate: `${videoBitrate}M`,
                    maxBitrate: '120M',
                    bufsize: '20M'
                });

                // Create a promise for each render and push it to the array
                const renderPromise = render(ffmpeg).then(response => {
                    if (!response.status) {
                        console.error(`Error in processing at index ${i}:`, response.data.error);
                    }
                });

                renderPromises.push(renderPromise); // Add the promise to the array
            }
        }

        // Wait for all render promises to complete
        await Promise.all(renderPromises);

        dispatch(DispatchEventEnum.IS_LOADING, DispatchEnum.TURN_OFF);
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
     * @param typeDirectory number
     * @param index number
     */
     let handleGetPackageAsDirectory = async (typeDirectory, index)  => {
        const data  = await getPackageAsDirectory();
        typeDirectory === DirectoryEnum.INPUT ? dataSource[index].input = data : dataSource[index].output = data;
    };

    /**
     * 
     * @param videos string[]
     */
    const generateInputFilesString = (videoDirectory, videos) => {
        const inputFiles = videos.map(video => `${videoDirectory}\\${video}`);
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

    const addRow = () => {
        dataSource = [...dataSource, { input: '', output: '', episodes: '' }]; // Add a new row with default values
    }

    /**
     * 
     * @param index: number
     */
    const deleteRow = (index) => {
        dataSource.splice(index, 1);
        dataSource = [...dataSource];
        
        if (dataSource.length === 0) {
            addRow();
        }
    }
    
    const reset = () => {
        dataSource = [{ input: '', output: '', episodes: '' }];
        speedFactor = 1;
        zoomFactor = 1;
        videoBitrate = 15
        preset = 'medium'
    }
    
</script>

<main>
    <div class='div-btn-add'>
        <Tooltip text='Thêm tập render' position='left'>
            <button class='btn-add' on:click={addRow}>+</button>
        </Tooltip>
    </div>

    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>No.</th>
                    <th scope="col">Input location</th>
                    <th scope="col">Output location</th>
                    <th scope="col">Imported videos</th>
                    <th scope="col">Action</th>
                </tr>
            </thead>
            <tbody>
                {#each dataSource as item, i}
                    <tr>
                        <td align="center" >{i + 1}</td>
                        <td align="center"> 
                            <span class="import-icon">
                                <button on:click={() => handleGetVideoDirectory(DirectoryEnum.INPUT, i)}>
                                    <i class="fa-solid fa-download fa-2xl" style="color: #FFFFFF;"></i>
                                </button>
                                <Input type='file-text' id={'input-' + 1} bind:value={item.input}/>
                            </span>
                        </td>
                        <td align="center">
                            <span class="import-icon">
                                <button on:click={() => handleGetPackageAsDirectory(DirectoryEnum.OUTPUT, i)}>
                                    <i class="fa-solid fa-download fa-2xl" style="color: #FFFFFF;"></i>
                                </button>
                                <Input type='file-text' id={'output' + 1} bind:value={item.output}/>
                            </span>
                        </td>
                        <td>
                            <Textarea placeholder='Import videos...' 
                                rows='1' 
                                cols='50' 
                                bind:value={item.episodes} />
                        </td>
                        <td>
                            <span class='trash-icon' >
                                <button on:click={() => deleteRow(i)}>
                                    <i class="fa-solid fa-trash fa-2xl"></i>
                                </button>
                            </span>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class='table-config'>
        <div>
            <Input label='Speed' id='speedFactor' type="number" bind:value={speedFactor} step="0.1" min="1" max="2" maxLength="1"/>
        </div>
        <div>
            <Input label='Zoom' id='zoomFactor' type="number" bind:value={zoomFactor} step="0.1" min="1" max="2" maxLength="1"/>
        </div>
        <div>
            
            <Input label='Birate' id='birate' type="number" bind:value={videoBitrate} step="1" min="1" max="200" maxLength="3"/>
        </div>
        <div>
            <Select text='Tốc độ render (Tốc độ càng nhanh chất lượng càng giảm)' position='top' class="select" label='Preset' id={preset}>
                <option value="fastest">Fastest</option>
                <option value="fast">Fast</option>
                <option value="medium">Medium</option>
                <option value="slow">Slow</option>
            </Select>
         </div>
    </div>

    <div class='btn-actions'>
        <Tooltip text="Reset tất cả giá trị về mặc định" position='bottom'>
            <button class='btn-action btn-action-reset' on:click={() => reset()}>
                <span>
                    <i class="fa-solid fa-arrows-rotate fa-2xl"></i>
                </span>
                <div>
                    RESET
                </div>
            </button>
        </Tooltip>
        <button class='btn-action btn-action-export' on:click={() => handleRunFfmpeg()}>
            <span>
                <i class="fa-solid fa-upload fa-2xl"></i>
            </span>
            <div>
                EXPORT
            </div>
        </button>
    </div>
</main>

<style>
    .table-wrapper {
        overflow: auto;
        border-radius: 5px;
        min-height: 450px;
        max-height: 450px;
        margin: 1em;
    }

    table {
        border-collapse: collapse;
        width: 100%;
        border-left: 1px solid #737373;
        border-right: 1px solid #737373;
    }

    thead th {
        position: sticky;
        top: 0;
        z-index: 1;
        background-color: #AEBFC6;
        border: 1px solid #AEBFC6;
    }
    thead tr th {
        position: sticky;
        top: 0;
        z-index: 1;
        background-color: #AEBFC6;
        border: 1px solid #CFCFCF;
    }

    thead tr th:not(:last-child) {
        border-right: 1px solid #CFCFCF;
    } 

    th, td {
        border-top: 1px solid #CFCFCF; 
        border-left: 1px solid #CFCFCF; 
        border-right: 1px solid #CFCFCF; 
        text-align: center;
    }

    tbody tr:last-child {
        border-bottom: 1px solid #CFCFCF;
    }

    tbody tr td:nth-child(2) ,
    tbody tr td:nth-child(3)  {
        background: #5D7D8C;
        color: #FFFFFF
    }

    .table-config {
        display: flex;
        justify-content: center;
        gap: 10rem;
    }

    .div-btn-add {
        display: flex;
        justify-content: end;
        margin: 0em 1em;
    }

    .btn-add {
        width: 35px;
        height: 35px;
        border: none;
        border-radius: 5px;
        background-color: #273238;
        font-size: larger;
        color: #FFFFFF;
    }

    .btn-add:hover {
        cursor: pointer;
        background-color: #36474F;
    }
    .btn-add:active {
        background-color: #5D7D8C;
    }

    .btn-actions {
        display: flex;
        justify-content: center;
        gap: 5em;
        margin: 2em 0em 0em 0em;
    }

    .btn-action {  
        width: 200px;
        height: 50px;
        border: none;
        border-radius: 5px;
        padding: 5px;
        color: #FFFFFF;
    }

    .btn-action-reset {
        background-color: #5D7D8C;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5em;
    }

    .btn-action:hover {
        cursor: pointer;
    }

    .btn-action-reset:active {
        background-color: #36474F;
    }
    
    .btn-action-export {
        background-color: #273238;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5em;
    }

    .btn-action-export:active {
        background-color: #36474F;
    }

    .import-icon button {
        outline: none;
        border: none;
        background-color: #5D7D8C;
    }

    .import-icon :hover {
        cursor: pointer;
    }
    
    .import-icon :active {
        opacity: 0.8;
    }

    .trash-icon button {
        outline: none;
        border: none;
        background-color: #FFFFFF;
    }

    .trash-icon :hover {
        cursor: pointer;
    }
    .trash-icon :active {
        opacity: 0.8;
    }
</style>