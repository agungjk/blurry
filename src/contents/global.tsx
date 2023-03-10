import classnames from "classnames"
import cssText from "data-text:~/contents/app.css"
import type { PlasmoCSConfig } from "plasmo"
import { useCallback, useEffect, useState } from "react"
import { CgErase } from "react-icons/cg"
import { HiCursorClick } from "react-icons/hi"
import { IoIosCloseCircle } from "react-icons/io"

import { useStorage } from "@plasmohq/storage/hook"

import { storage, storageKey } from "~config"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  css: ["global.css"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const hoverClass = "___blurelement-hover",
  blurClass = "___blurelement-blur"

const ToolbarModule = () => {
  const [selectElement, setSelectElement] = useState<boolean>()
  const [selectText, setSelectText] = useState<boolean>()
  const [xpathData, setXpathData] = useState([])

  const [isEnabled] = useStorage({
    key: storageKey,
    instance: storage
  })

  const getXPath = useCallback((el) => {
    if (typeof el == "string")
      return document.evaluate(el, document, null, 0, null)
    if (!el || el.nodeType != 1) return ""
    if (el.id) return "//*[@id='" + el.id + "']"
    var sames = [].filter.call(el.parentNode.children, function (x) {
      return x.tagName == el.tagName
    })
    return (
      getXPath(el.parentNode) +
      "/" +
      el.tagName.toLowerCase() +
      (sames.length > 1 ? "[" + ([].indexOf.call(sames, el) + 1) + "]" : "")
    )
  }, [])

  const unwrap = (who) => {
    const pa = who.parentNode
    while (who.firstChild) {
      pa.insertBefore(who.firstChild, who)
    }
    pa.removeChild(who)
  }

  const onMouseover = (e) => {
    console.log("🚀 ~ file: global.tsx:78 ~ onMouseover ~ onMouseover:", e)
    e.stopPropagation()
    const target = e.target
    const isNotToolbar = !target?.getAttribute("class")?.includes("blurry")
    const isNotRoot = !["HTML", "BODY"].includes(target?.tagName)
    if (isNotToolbar && isNotRoot) {
      target?.classList?.add(hoverClass)
    }
  }

  const onMouseout = (e) => {
    e.stopPropagation()
    e.target.classList.remove(hoverClass)
  }

  const onClose = () => {
    storage.set(storageKey, false)
    setSelectElement(false)
  }

  const onClear = (e) => {
    e.stopPropagation()
    setXpathData([])

    const blurs = document.querySelectorAll(".___blurelement-blur")
    for (let index = 0; index < blurs.length; index++) {
      const el = blurs[index]
      el.classList.remove(blurClass)
    }
    const marks = document.querySelectorAll(".___blurelement-mark")
    for (let index = 0; index < marks.length; index++) {
      const el = marks[index]
      unwrap(el)
    }
  }

  const onClick = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      let newXpathData = [...xpathData]
      const target = e.target
      const isNotToolbar =
        !target?.getAttribute("class")?.includes("blurry") &&
        !target?.parentNode?.getAttribute("class")?.includes("blurry")
      const isNotRoot = !["HTML", "BODY", "PLASMO-CSUI"].includes(
        target?.tagName
      )
      if (isNotToolbar && isNotRoot) {
        target.classList.toggle(blurClass)
        const xpath = getXPath(target)
        if (target.getAttribute("class")?.includes(blurClass)) {
          newXpathData.push(xpath)
        } else {
          newXpathData = newXpathData.filter((xpt) => xpt != xpath)
        }
        setXpathData(newXpathData)
      }
    },
    [getXPath, xpathData]
  )

  useEffect(() => {
    if (selectElement) {
      document.addEventListener("mouseover", onMouseover)
      document.addEventListener("mouseout", onMouseout)
      document.addEventListener("click", onClick)
    } else {
      document.removeEventListener("mouseover", onMouseover, false)
      document.removeEventListener("mouseout", onMouseout, false)
      document.removeEventListener("click", onClick, false)
    }

    return () => {
      document.removeEventListener("mouseover", onMouseover, false)
      document.removeEventListener("mouseout", onMouseout, false)
      document.removeEventListener("click", onClick, false)
    }
  }, [selectElement])

  const onToggleSelectElement = () => {
    const willEnable = !selectElement == true
    if (willEnable && selectText) {
      setSelectText(false)
    }
    setSelectElement(!selectElement)
  }

  if (!isEnabled) {
    return null
  }

  return (
    <div className="blurry noselect">
      <div className="blurry-toolbar">
        <div
          onClick={onToggleSelectElement}
          className={classnames(
            "blurry-toolbar-menu",
            selectElement ? "active" : ""
          )}>
          <HiCursorClick size="1.2em" className="blurry-toolbar-menu-icon" />
          <span className="blurry-toolbar-menu-label">Select</span>
        </div>
        <div onClick={onClear} className="blurry-toolbar-menu">
          <CgErase size="1.2em" className="blurry-toolbar-menu-icon" />
          <span className="blurry-toolbar-menu-label">Erase All</span>
        </div>
        <div onClick={onClose} className="blurry-toolbar-menu">
          <IoIosCloseCircle size="1.2em" className="blurry-toolbar-menu-icon" />
          <span className="blurry-toolbar-menu-label">Close</span>
        </div>
      </div>
    </div>
  )
}

export default ToolbarModule
