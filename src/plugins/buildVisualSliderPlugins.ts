import { PivProps, createPlugin } from "../piv"

/** pluginCreator for VisualSlider */
export function buildVisualSliderPlugins() {
  const plugin = createPlugin(
    () => () => {
      return {
        icss: {
          ".visual-slider": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden",
            ".visual-slider__container": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              position: "relative",
              overflow: "hidden",
              ".visual-slider__slide": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                opacity: 0,
                transition: "opacity 0.3s",
                "&.active": {
                  opacity: 1,
                },
              },
              ".visual-slider__slide--prev, .visual-slider__slide--next": {
                zIndex: 1,
              },
              ".visual-slider__slide--prev": {
                left: "-100%",
              },
              ".visual-slider__slide--next": {
                left: "100%",
              },
            },
            ".visual-slider__control": {
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 2,
              "&.prev": {
                left: "0.5rem",
              },
              "&.next": {
                right: "0.5rem",
              },
            },
            ".visual-slider__pagination": {
              position: "absolute",
              bottom: "0.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              ".visual-slider__pagination-item": {
                display: "inline-block",
                width: "0.5rem",
                height: "0.5rem",
                borderRadius: "50%",
                backgroundColor: "#fff",
                opacity: 0.5,
                transition: "opacity 0.3s",
                "&.active": {
                  opacity: 1,
                },
                "& + .visual-slider__pagination-item": {
                  marginLeft: "0.5rem",
                },
              },
            },
          },
        },
      } satisfies PivProps
    },
    {
      name: "visual-slider",
    },
  )
}
