<script>
    import Button from '../common/components/button.svelte';
    import { getVideoDirectory, writeToFile } from '../services/command.service.js';
    import Input from "../common/components/input.svelte";
    import Textarea from "../common/components/textarea.svelte";
    import { DirectoryEnum } from '../enums/DirectoryEnum.svelte';

    let videoDirectory;
    let speedFactor = 1;
    let zoomFactor = 1;
    let preset = 'fast';
    let outputDirectory;
    let inputFiles;
    let concatValue;
    let scriptContent;  
        
    const handleWriteToFile = async () => {
        for (const script of dataSource) {
            console.log('script:::', script.episodes);
            const episodeFiles = gatherEpisodes(script.episodes);
            console.log('script.episodes:::', episodeFiles);

            videoDirectory = script.input;
            outputDirectory = script.output;
            concatValue = episodeFiles.length;
            inputFiles = generateInputFilesString(episodeFiles)

            console.log('videoFiles:::', inputFiles);
            if (videoDirectory !== undefined && outputDirectory !== undefined) {
                scriptContent = generateScriptContent(videoDirectory, outputDirectory, preset, inputFiles, episodeFiles[0]);
                console.log('content', scriptContent);
            }

            await writeToFile(scriptContent);

        }
        // return data;
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
    const generateInputFilesString = (videos) => {
        const inputFiles = videos.map(video => `-i "!video_directory!\\${video}"`).join(' ');

        return `"input_files=${inputFiles}"`;
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

    const generateScriptContent = (videoDirectory, outputDirectory, preset, inputFiles, outputFile) => {
        return `@echo off
        setlocal enabledelayedexpansion
            
        REM Define main variables
        set "video_directory=${videoDirectory}"
            
        REM Processing parameters
        set "speed_factor=${speedFactor}"          REM ${speedFactor * 100}% speed-up
        set "zoom_factor=${zoomFactor}"            REM ${(zoomFactor - 1) * 100}% zoom-in
        set "output_width=1920"                    REM Output width after cropping
        set "output_height=1080"                   REM Output height after cropping
        set "video_bitrate=15M"                    REM Target average bitrate
        set "max_bitrate=15M"                      REM Maximum bitrate
        set "bufsize=20M"                          REM Buffer size
        set "nvenc_preset=${preset}"               REM Fast NVENC preset
        set "nvenc_profile=main"                   REM H.264 profile
        set "nvenc_rc=cbr"                         REM Constant bitrate mode
            
        set "output_directory=${outputDirectory}"
        set "output_file=!output_directory!\\${outputFile}"
        set ${inputFiles}
        set "concat_value=${concatValue}"
        call :process_videos
            
        REM Check if FFmpeg is installed
        where ffmpeg >nul 2>&1
        if errorlevel 1 (
            echo "FFmpeg is not installed or not in the system PATH. Exiting."
            exit /b
        )

        REM Call processing function
        call :process_videos

        REM Exit script
        goto :eof

        :process_videos
        REM Create output directory if it doesn't exist
        if not exist "!output_directory!" mkdir "!output_directory!"

        REM Apply filters and encoding
        ffmpeg -y -threads 8 !input_files! -filter_complex "[0:v][0:a][1:v][1:a]concat=n=!concat_value!:v=1:a=1[v][a];[v]scale=w=iw*!zoom_factor!:h=ih*!zoom_factor!,crop=w=!output_width!:h=!output_height!:x=(iw-!output_width!)/2:y=(ih-!output_height!)/2,setpts=PTS/!speed_factor!,fps=30[vout];[a]atempo=!speed_factor!,aresample=async=1[aout]" -map "[vout]" -map "[aout]" -c:v h264_nvenc -preset !nvenc_preset! -profile:v !nvenc_profile! -rc cbr -b:v !video_bitrate! -maxrate !max_bitrate! -bufsize !bufsize! -g 30 -pix_fmt yuv420p -tune ll -flags +low_delay -movflags +faststart -c:a aac -b:a 192k "!output_file!"

        if errorlevel 1 (
            echo "Error during processing. See FFmpeg output for details."
        ) else (
            echo "Processing completed. Output saved at: !output_file!"
        )
        goto :eof`;
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
                            <Button on:click={() => handleGetVideoDirectory(DirectoryEnum.INPUT, i)} class='btn main-btn'>Select</Button>
                            <Input label='Input' id={'input-' + 1} bind:value={item.input}/>
                        </td>
                        <td align="center">
                            <Button on:click={() => handleGetVideoDirectory(DirectoryEnum.OUTPUT, i)} class='btn main-btn'>Select</Button>
                            <Input label='Output' id={'output' + 1} bind:value={item.output}/></td>
                        <!-- <td><Input type='number' bind:value={item.recordings} /></td> -->
                        <td><Textarea placeholder='Enter episodes...' rows='4' cols='60' bind:value={item.episodes} /></td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="d-flex flex-container">
        <div>
            <Button class='btn main-btn w-6' on:click={addRows}>Add row</Button>
        </div>
        <div>
            <Input label='Speed-up' id='speedFactor' class="input" type="number" bind:value={speedFactor} step="0.1" min="1" max="2" />
        </div>
        <div>
            <Input label='Zoom-in' id='zoomFactor' class="input" type="number" bind:value={zoomFactor} step="0.1" min="1" max="2" />
        </div>
        <div>
            <!-- <Input type='number' bind:value={preset}/> -->
            <Button class="btn main-btn w-6">Preset</Button>
         </div>
    </div>

    <div>
        <Button class='btn main-btn'  on:click={() => handleWriteToFile(scriptContent)}> Execute</Button>
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