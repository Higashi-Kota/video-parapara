import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace VideoFrameExtractor;

@route("/api/videos")
namespace Videos {
  @doc("Upload a video file")
  @post
  op upload(@body request: VideoUploadRequest): VideoUploadResponse | Error;

  @doc("Get video information")
  @get
  @route("/{videoId}")
  op get(@path videoId: string): VideoInfo | NotFoundError;

  @doc("Delete a video and its extracted frames")
  @delete
  @route("/{videoId}")
  op delete(@path videoId: string): void | NotFoundError;

  @doc("List all videos")
  @get
  op list(): VideoInfo[];
}

@route("/api/extract")
namespace Extract {
  @doc("Start frame extraction job")
  @post
  op start(
    @body request: {
      videoId: string;
      options?: ExtractionOptions;
    },
  ): ExtractionJob | NotFoundError | Error;

  @doc("Get extraction job status")
  @get
  @route("/{jobId}")
  op getStatus(@path jobId: string): ExtractionJob | NotFoundError;

  @doc("Cancel extraction job")
  @delete
  @route("/{jobId}")
  op cancel(@path jobId: string): void | NotFoundError;
}

@route("/api/frames")
namespace Frames {
  @doc("Get frames for a video")
  @get
  op list(@query videoId: string): FrameInfo[] | NotFoundError;

  @doc("Download all frames as ZIP")
  @get
  @route("/download")
  op download(@query videoId: string): bytes | NotFoundError;
}

@error
model Error {
  @statusCode statusCode: 400 | 500;
  message: string;
}

@error
model NotFoundError {
  @statusCode statusCode: 404;
  message: string;
}
