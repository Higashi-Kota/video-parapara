import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";
import "@typespec/openapi3";

import "./models/video.tsp";
import "./models/frame.tsp";
import "./operations/extract.tsp";
import "./operations/health.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{
  title: "Video Frame Extractor API",
})
@server("http://localhost:3001", "Development server")
namespace VideoFrameExtractor;
