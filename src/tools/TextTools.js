import * as THREE from "three";

export function LineWrappedText(options) {
  // options: string, size, lineSpacing, material, lineLength, height, justify, lineBreakChars[]
  LineWrappedText.prototype.Create = function (options) {
    var group = new THREE.Object3D();
    group.name = "Text-" + options.string;

    var string = options.string || "";
    var size = options.size || 1;
    var lineSpacing = options.lineSpacing || 0;
    var height = options.height || 0.01;
    var lineLength = options.lineLength || 10;
    var material = options.material || new THREE.MeshBasicMaterial({ color: 0xffffff });
    var justify = options.justify || "left";
    var breakChars = [];
    var curveSegments = options.curveSegments || 10;

    breakChars.push.apply(breakChars, options.lineBreakChars);

    var position = {
      x: 0,
      y: 0,
      z: 0,
    };

    let cutPoint = -1;
    let safecount = 0;
    let offsetSum = 0;

    const centerText = (mesh) => {
      mesh.geometry.computeBoundingBox();
      let size = mesh.geometry.boundingBox.max.x;
      position.x -= size / 2;
    };

    const rightAlignText = (mesh) => {
      mesh.geometry.computeBoundingBox();
      let size = mesh.geometry.boundingBox.max.x;
      position.x -= size;
    };

    const createGeo = (text) => {
      let textMesh;
      text = text.trim();
      // Create line geometry, material, and mesh

      const makeTextGeo = () => {
        let textGeometry = new THREE.TextGeometry(text, {
            size: size,
            height: height,
            font: options.font,
            curveSegments: curveSegments,
          }),
          textMaterial = material;
        textMesh = new THREE.Mesh(textGeometry, textMaterial);
        return textMesh;
      };

      switch (justify) {
        case "left":
          textMesh = makeTextGeo();
          break;
        case "center":
          textMesh = makeTextGeo();
          centerText(textMesh);
          break;
        case "right":
          textMesh = makeTextGeo();
          rightAlignText(textMesh);
          break;
        default:
          break;
      }

      textMesh.position.set(position.x, position.y, position.z);
      group.add(textMesh);
      position.y -= size * (lineSpacing + 1) - offsetSum;
      offsetSum = 0;
      position.x = 0;
    };

    const cutLine = (text, index) => {
      // cut line at index, return newLine and leftover
      let newLine = text.substring(0, index);
      let leftoverText = text.slice(index);
      return {
        newLine: newLine,
        leftover: leftoverText,
      };
    };

    const findCutIndex = (text, lineLength, startIndex) => {
      // find and return string index to cut line
      let index = 0;

      if (text.charAt(lineLength) === " ") {
        index = 0;
      } else {
        // search for closest space
        let counter = 1;

        while (text.charAt(lineLength - counter) !== " ") {
          counter++;

          if (lineLength - counter <= 0) {
            console.error("TextWrapper: can't resolve line length: " + lineLength + ": " + text);
            break;
          }
        }
        index = counter;
      }

      return index;
    };

    const checkForLinebreak = (text, lineLength, startIndex) => {
      if (startIndex == null) startIndex = 0;

      // look for line break character
      let cutPoint = text.indexOf("\n", startIndex + 1);
      if (cutPoint > lineLength + startIndex) cutPoint = -1;
      return cutPoint;
    };

    const checkForExtraBreakChars = (text, lineLength, startIndex) => {
      if (startIndex == null) startIndex = 0;
      let cutPoint = lineLength + startIndex + 1;

      // look for line break characters
      breakChars.forEach((c) => {
        let lb = text.indexOf(c, startIndex + 1);

        cutPoint = Math.min(cutPoint, lb + 1);
      });

      if (cutPoint > lineLength + startIndex) cutPoint = -1;

      return cutPoint;
    };

    const evaluateText = (text, startIndex) => {
      if (startIndex == null) startIndex = 0;
      // first look for a line break
      let cutIndex = checkForLinebreak(text, lineLength, startIndex);
      if (cutIndex > 0) {
        let textParts = cutLine(text, cutIndex);
        createGeo(textParts.newLine);
        evaluateText(textParts.leftover, 0);
      } else {
        // look for extra line break chars
        let cutIndex = checkForExtraBreakChars(text, lineLength, startIndex);

        if (cutIndex > 0) {
          let textParts = cutLine(text, cutIndex);

          createGeo(textParts.newLine);
          evaluateText(textParts.leftover, 0);
        } else {
          // otherwise, compare against length
          if (text.length > lineLength + startIndex && safecount < 100) {
            cutIndex = findCutIndex(text, lineLength + startIndex);
            if (cutIndex >= 0) {
              // need to cut

              let textParts = cutLine(text, lineLength - cutIndex);
              createGeo(textParts.newLine);

              // recursive call
              safecount++;

              evaluateText(textParts.leftover, 0);
            }
          } else {
            // dont need to cut any more

            createGeo(text);
          }
        }
      }
    };

    if (string != "" && string != undefined) evaluateText(string, 0);

    return group;
  };
}
