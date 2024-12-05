<script>
    import { onMount } from 'svelte';
    import Button from '../common/components/button.svelte';
    import { runScript, writeToFile } from '../services/command.service.js';
    import Input from "../common/components/input.svelte";
    import Textarea from "../common/components/textarea.svelte";

    let videoDirectory;
    let speedFactor;
    let zoomFactor;
    let preset;
    let firstOutputDirectory;
    let secondOutputDirectory;
    let concatValue;
    let scriptContent = '';

    $: videoDirectory = `G:\\Shared drives\\GTA_NOI BO\\Video Hoan Thien`;
    $: speedFactor = 1;
    $: zoomFactor = 1;
    $: preset = 'fast';
    $: firstOutputDirectory = `D:\\thu_7`;
    $: secondOutputDirectory = `D:\\chu_nhat`
    $: scriptContent = `
        @echo off
        setlocal enabledelayedexpansion

        REM Define main variables
        set "video_directory=${videoDirectory}"

        REM Processing parameters
        set "speed_factor=${speedFactor}"          REM ${speedFactor * 100}% speed-up
        set "zoom_factor=${zoomFactor}"            REM ${(zoomFactor - 1) * 100}% zoom-in
        set "output_width=1920"                    REM Output width after cropping
        set "output_height=1080                    REM Output height after cropping
        set "video_bitrate=15M"         REM Target average bitrate
        set "max_bitrate=15M"           REM Maximum bitrate
        set "bufsize=20M"               REM Buffer size
        set "nvenc_preset=${preset}"    REM Fast NVENC preset
        set "nvenc_profile=main"        REM H.264 profile
        set "nvenc_rc=cbr"              REM Constant bitrate mode

        REM Define days and their video lists
        for %%D in (thu_7 chu_nhat) do (
            if %%D==thu_7 (
                REM First list for thu_7
                set "output_directory=${firstOutputDirectory}"
                set "output_file=!output_directory!\\GTA_658.mp4"
                set "input_files=-i "!video_directory!\\Bhive_GTA_658.mp4" -i "!video_directory!\\Bhive_GTA_670.mp4" -i "!video_directory!\\Bhive_GTA_655.mp4" -i "!video_directory!\\Bhive_GTA_692.mp4""
                set "concat_value=${concatValue}"
                call :process_videos

            ) else if %%D==chu_nhat (
                REM First list for chu_nhat
                set "output_directory=${secondOutputDirectory}"
                set "output_file=!output_directory!\\GTA_718.mp4"
                set "input_files=-i "!video_directory!\\Bhive_GTA_718.mp4" -i "!video_directory!\\Bhive_GTA_723.mp4" -i "!video_directory!\\Bhive_GTA_725.mp4" -i "!video_directory!\\Bhive_GTA_712.mp4""
                set "concat_value=${concatValue}"
                call :process_videos
            )
        )

        REM Function to process videos
        :process_videos
            REM Create output directory if it doesn't exist
            if not exist "!output_directory!" mkdir "!output_directory!"

            REM Apply filters and encoding for each day's files with scaling
            ffmpeg -y -threads 8 !input_files! -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a]concat=n=!concat_value!:v=1:a=1[v][a];[v]scale=w=iw*!zoom_factor!:h=ih*!zoom_factor!,crop=w=!output_width!:h=!output_height!:x=(iw-!output_width!)/2:y=(ih-!output_height!)/2,setpts=PTS/!speed_factor!,fps=30[vout];[a]atempo=!speed_factor!,aresample=async=1[aout]" -map "[vout]" -map "[aout]" -c:v h264_nvenc -preset !nvenc_preset! -profile:v !nvenc_profile! -rc cbr -b:v !video_bitrate! -maxrate !max_bitrate! -bufsize !bufsize! -g 30 -pix_fmt yuv420p -tune ll -flags +low_delay -movflags +faststart -c:a aac -b:a 192k "!output_file!"

            echo "Processing for %%D completed. Output saved at: !output_file!"
            goto :eof
    `;

    let handleWriteToFile;

    let data = [{
        input: '',
        output: '',
        episode: ''
    }];

    function addRows() {
        data = [...data, { input: '', output: '', episode: '' }]; // Add a new row with default values
    }

    // Life cycles
    onMount(() => {
        handleWriteToFile = writeToFile; // Assign the function to handleWriteToFile
        // handleWriteToFile = runScript; // Assign the function to runScript
    })
</script>

<main>
    <div>
        <table class="table">
            <thead>
                <tr>
                    <th>Vị trí Input</th>
                    <th>Vị trí Output</th>
                    <th>Số tập ghi chép</th>
                </tr>
            </thead>
            <tbody>
                {#each data as item, i}
                    <tr>
                        <td><Input label='Input' id='input' type='file' bind:value={item.input} webkitdirectory/></td>
                        <td><Input label='Output'id='output' type='file' bind:value={item.output} webkitdirectory/></td>
                        <!-- <td><Input type='number' bind:value={item.recordings} /></td> -->
                        <td><Textarea placeholder='Enter episodes...' rows='4' cols='50' bind:value={item.episode} /></td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <Button class='btn main-btn w-6' on:click={addRows}>Add row</Button>
    </div>

    <div class="d-flex flex-container w-auto">
        <div>
            <Input label='Speed-up' id='speedFactor' class="input" type="number" bind:value={speedFactor} step="0.1" min="1" max="2" />
        </div>
        <div>
            <Input label='Zoom-in' id='zoomFactor' class="input" type="number" bind:value={zoomFactor} step="0.1" min="1" max="2" />
        </div>
        <div>
            <!-- <label for="preset">Preset</label>
            <input type='number' bind:value={preset}/> -->
            <Button class="btn main-btn w-6">Preset</Button>
         </div>
    </div>

    <div>
        <Button class='btn main-btn'  on:click={() => handleWriteToFile(scriptContent)}> Execute</Button>
    </div>
</main>

<style>
    th, td {
        padding: 8px;
        text-align: left;
        border: 1px solid #ddd;
    }

    thead {
        background-color: #f2f2f2;
        /* border: 1px solid #ffffff; */
    }

    div {
        margin-bottom: 20px;
    }
</style>