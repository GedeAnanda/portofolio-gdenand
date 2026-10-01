import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import ImageIO
import UniformTypeIdentifiers

// Cuts the person out of a photo with Apple's Vision framework (runs locally, macOS 14+)
// and writes the small transparent PNG the hero pin board is built from.
//
// usage: swift scripts/portrait-cutout.swift <input.jpg> <preview.png> <cutout.png> <cropX> <cropY> <cropW> <cropH> <outW> <outH>
// The crop is in source pixels, top-left origin. The current portrait was made with:
//   swift scripts/portrait-cutout.swift public/avatar.jpg /tmp/preview.png public/images/portrait-pins.png 308 178 758 948 160 200
let args = CommandLine.arguments
let inURL = URL(fileURLWithPath: args[1])
let previewURL = URL(fileURLWithPath: args[2])
let cutoutURL = URL(fileURLWithPath: args[3])
let crop = CGRect(x: Double(args[4])!, y: Double(args[5])!, width: Double(args[6])!, height: Double(args[7])!)
let outW = Int(args[8])!, outH = Int(args[9])!

guard let src = CGImageSourceCreateWithURL(inURL as CFURL, nil),
      let cg = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fatalError("load") }

let handler = VNImageRequestHandler(cgImage: cg, options: [:])
let req = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([req])
guard let obs = req.results?.first else { fatalError("no subject") }
print("instances:", obs.allInstances.count)
let maskedBuf = try obs.generateMaskedImage(ofInstances: obs.allInstances, from: handler, croppedToInstancesExtent: false)

let ctx = CIContext()
let full = CIImage(cvPixelBuffer: maskedBuf)
print("masked size:", full.extent)

func write(_ img: CIImage, _ url: URL) {
  let cs = CGColorSpace(name: CGColorSpace.sRGB)!
  guard let out = ctx.createCGImage(img, from: img.extent, format: .RGBA8, colorSpace: cs) else { fatalError("cg") }
  let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, out, nil)
  CGImageDestinationFinalize(dest)
}

// Preview of the whole cutout over mid-grey, downscaled.
let grey = CIImage(color: CIColor(red: 0.5, green: 0.5, blue: 0.5)).cropped(to: full.extent)
let comp = full.composited(over: grey)
let s = 700.0 / full.extent.height
write(comp.transformed(by: CGAffineTransform(scaleX: s, y: s)), previewURL)

// Crop (top-left origin coords from args -> CI bottom-left origin) and scale.
let H = full.extent.height
let ciCrop = CGRect(x: crop.origin.x, y: H - crop.origin.y - crop.height, width: crop.width, height: crop.height)
let cropped = full.cropped(to: ciCrop).transformed(by: CGAffineTransform(translationX: -ciCrop.origin.x, y: -ciCrop.origin.y))
let sx = Double(outW) / crop.width, sy = Double(outH) / crop.height
let scaled = cropped.applyingFilter("CILanczosScaleTransform", parameters: [kCIInputScaleKey: sy, kCIInputAspectRatioKey: sx / sy])
write(scaled.cropped(to: CGRect(x: 0, y: 0, width: outW, height: outH)), cutoutURL)
print("done")
