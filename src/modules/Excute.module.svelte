<script>
    import { success, warning, failure } from '../common/components/toast.component'
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
    let existingVideos = []; 

    const handleRunFfmpeg = async () => {
        dispatch(DispatchEventEnum.IS_LOADING, DispatchEnum.TURN_ON);
        
        const renderPromises = [];
        let overallSuccess = true;

        for (let i = 0; i < dataSource.length; i++) {
            const script = dataSource[i];

            if (!script.input || !script.output || !script.episodes) {
                warning(`Thông tin các cột của dòng ${i + 1} còn trống. Vui lòng kiểm tra lại!`);
                dispatch(DispatchEventEnum.IS_LOADING, DispatchEnum.TURN_OFF);
                return;
            }

            const episodeFiles = gatherEpisodes(script.episodes);

            videoDirectory = script.input;
            outputDirectory = createOutputDirectory(script.prefix, script.output);
            concatValue = episodeFiles.length;
            inputFiles = generateInputFilesString(videoDirectory, episodeFiles, existingVideos, i + 1);

            if (inputFiles.length === 0) {
                overallSuccess = false;
                break;
            };

            if (videoDirectory !== undefined && outputDirectory !== undefined && inputFiles.length > 0) {
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

                const renderPromise = render(ffmpeg)
                .then(response => {
                    if (!response.status) {
                        overallSuccess = false;
                        failure(response.message);
                    }
                }).catch(error => {
                    overallSuccess = false;
                })

                renderPromises.push(renderPromise); 
            }
        }

        if (overallSuccess) {
            await Promise.all(renderPromises);
        }
       

        if (overallSuccess) {
            success('Hoàn tất quá trình render!');
            reset();
        } else {
        }

        dispatch(DispatchEventEnum.IS_LOADING, DispatchEnum.TURN_OFF);
    };

    /**
     * 
     * @param prefix string
     * @param output string
     */
    function createOutputDirectory(prefix, output) {
        // Extract the directory path and the file name
        const lastBackslashIndex = output.lastIndexOf('\\');
        
        let directoryPath;
        let fileNameWithPrefix;

        // Check if the last backslash exists
        if (lastBackslashIndex !== -1) {
            directoryPath = output.substring(0, lastBackslashIndex); // Get directory path
            const fileName = output.substring(lastBackslashIndex + 1); // Get file name
            
            // Prepend the prefix to the file name
            if (prefix) {
                fileNameWithPrefix = `${prefix}${fileName}`; // HD_VIDEO_1.mp4
            } else {
                fileNameWithPrefix = fileName; // Just the file name if no prefix
            }
        } else {
            // Handle case where no backslash is found (invalid path)
            return null;
        }

        // Construct the final output directory
        const outputDirectory = `${directoryPath}\\${fileNameWithPrefix}`;
        return outputDirectory;
    }

    /**
     * 
     * @param typeDirectory number
     * @param index number
     */
    let handleGetVideoDirectory = async (typeDirectory, index)  => {
        const { fileTxtPath, files}  = await getVideoDirectory();
        existingVideos = [...files];
        typeDirectory === DirectoryEnum.INPUT ? dataSource[index].input = fileTxtPath : dataSource[index].output = fileTxtPath;
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
     * @param videoDirectory string[]
     * @param videos string[]
     * @param existingVideos string[]
     */
     const generateInputFilesString = (videoDirectory, videos, existingVideos, row) => {
        // Convert existingVideos to a Set for faster lookups
        const existingVideosSet = new Set(existingVideos);

        // Check for missing videos
        const missingVideos = videos.filter(video => !existingVideosSet.has(video));
        if (missingVideos.length > 0) {
            warning(`Dòng ${row} chứa các video không tồn tại: ${missingVideos.join(', ')}`);
            return [];
        } {
            // Generate input file paths
            const inputFiles = videos.map(video => `${videoDirectory}\\${video}`);
            return inputFiles;
        }
    };

    /**
     * 
     * @param prefix string
     * @param episode string
     */
     const gatherEpisodes = (episode) => {
        // Regular expression to match file name patterns (alphanumeric with underscores, excluding Vietnamese characters)
        const fileNameRegex = /\b[a-zA-Z0-9_]+\b/g;

        const fileNames = episode.match(fileNameRegex);
        
        // Add '.mp4' to each filename, ensuring we don't return undefined
        const fileNamesWithExtension = fileNames ? fileNames.map(fileName => fileName + '.mp4') : [];
        
        return fileNamesWithExtension;
    };

    
    let dataSource = [{
        input: '',
        output: '',
        prefix: '',
        episodes: ''
    }];

    const addRow = () => {
        dataSource = [...dataSource, { input: '', output: '', prefix: '', episodes: '' }]; // Add a new row with default values
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
        dataSource = [{ input: '', output: '', prefix: '', episodes: '' }];
        speedFactor = 1;
        zoomFactor = 1;
        videoBitrate = 15
        preset = 'medium'
    }
    
    const countVideos = (episodes) => {
        if (!episodes) return 0; 
        
        const videoArray = episodes.split(',').map(video => video.trim()).filter(Boolean);
        return videoArray.length;
    };
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
                    <th scope="col">Quantity</th>
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
                                <Input 
                                    onClick={() => handleGetVideoDirectory(DirectoryEnum.INPUT, i)}
                                    type='file-text' id={'input' + 1} bind:value={item.input}
                                />
                            </span>
                        </td>
                        <td align="center">
                            <span class="import-icon">
                                <button on:click={() => handleGetPackageAsDirectory(DirectoryEnum.OUTPUT, i)}>
                                    <i class="fa-solid fa-download fa-2xl" style="color: #FFFFFF;"></i>
                                </button>
                                <Input 
                                    onClick={() => handleGetPackageAsDirectory(DirectoryEnum.OUTPUT, i)}
                                    type='file-text' id={'output' + 1} bind:value={item.output}
                                />
                            </span>
                        </td>   
                        <td align="center">
                            <div class='imported-videos'>
                                <Input type='text' id={'prefix' + 1} bind:value={item.prefix} placeholder='Cú pháp tên video'/>
                                <Textarea placeholder='Import videos...' 
                                rows='1' 
                                cols='35' 
                                bind:value={item.episodes} />
                            </div>
                        </td>
                        <td align="center" >{countVideos(item.episodes)}</td>
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
            
            <Input label='Bitrate' id='bitrate' type="number" bind:value={videoBitrate} step="1" min="1" max="200" maxLength="3"/>
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

    .imported-videos {
        display: flex;
        gap: 0.5em;
    }
</style>