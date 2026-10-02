# nps

## Figma и контент

- Актуальный Figma — источник визуальной истины; Figma text variables — источник контента.
- Desktop design задаёт canonical content, порядок и mapping. Tablet/mobile — адаптации, если Figma явно не задаёт breakpoint-specific content.
- Не используй `utils/content/token.json` или другой intermediate store как альтернативный источник текста.
- Не выдумывай отсутствующие значения, размеры, состояния или контент. Если источник неполон или недоступен, запроси решение.
- В общении используй имена layers/frames/components. Raw node IDs показывай только по запросу или для необходимого debugging handoff.

## Assets и навыки

- Получай Figma assets через доступные official MCP tools; когда они возвращают download URL, сохраняй файл напрямую на диск разрешённым способом.
- Не запрашивай bulk inline base64 и dumped JSON ради загрузки assets в контекст. Это не запрещает targeted screenshot, необходимый для visual verification.
- Для section implementation прочитай `utils/content/skills/figma-section-implementation/SKILL.md`.
- Для content sync или audit используй соответствующий skill из `utils/content/skills/`, только если его действующая процедура не противоречит правилу Figma source of truth.

## Visual verification

- Для каждого изменённого section и breakpoint получи актуальный reference screenshot и сравни с результатом в браузере.
- Установи реальный viewport нужной ширины; CSS width у body не заменяет viewport.
- Получи exact font size, line-height и weight из Figma; проверь wrapping и visible alignment.
- Не добавляй manual line breaks автоматически: используй их только когда это следует из дизайна и после проверки других breakpoints.
- Text в buttons, tags, badges и pills центрируется по обоим направлениям, если источник явно не требует смещения.
- Исправь обнаруженные визуальные расхождения до готовности. Если required reference или проверка недоступны, сообщи ограничение и не заявляй полной visual acceptance.
- Используй существующие project tests; точную команду установи по package/scripts, а не по предположению о framework.
