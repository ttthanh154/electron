export class FfmpegModel {
    constructor (model) {
        this.outputWidth = model.outputWidth;
        this.outputHeight = model.outputHeight;
        this.speedFactor = model.speedFactor;
        this.zoomFactor = model.zoomFactor;
        this.preset = model.preset;
        this.inputFiles = model.inputFiles;
        this.outputFile = model.outputFile;
        this.concatValue = model.concatValue;
        this.profile = model.profile;
        this.videoBitrate = model.videoBitrate;
        this.maxBitrate = model.maxBitrate;
        this.bufsize = model.bufsize
    }
}