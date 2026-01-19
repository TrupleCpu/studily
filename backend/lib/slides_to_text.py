def slides_to_text(slides):
    sections = []

    for slide in slides:
        parts = []
        if slide["title"]:
            parts.append(f"Title: {slide['title']}")
        parts.extend(slide["text"])
        if slide["notes"]:
            parts.append(f"Notes: {slide['notes']}")

        section_text = "\n".join(parts)
        sections.append(section_text)

    return "\n\n---\n\n".join(sections)
