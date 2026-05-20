import argparse
import json
import mailbox
import re
from email.header import decode_header
from email.utils import getaddresses, parsedate_to_datetime


def decode_header_value(value: str | None) -> str | None:
    if not value:
        return None
    parts = []
    for fragment, charset in decode_header(value):
        if isinstance(fragment, bytes):
            try:
                parts.append(fragment.decode(charset or "utf-8", errors="replace"))
            except Exception:
                parts.append(fragment.decode("utf-8", errors="replace"))
        else:
            parts.append(fragment)
    return "".join(parts).strip() or None


def extract_text(msg) -> tuple[str, str | None]:
    """
    Returns (text, html_optional)
    Prefers text/plain; falls back to stripped html.
    """
    text_parts: list[str] = []
    html_parts: list[str] = []

    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            disp = part.get_content_disposition()
            if disp == "attachment":
                continue
            try:
                payload = part.get_payload(decode=True)
            except Exception:
                payload = None
            if payload is None:
                continue
            charset = part.get_content_charset() or "utf-8"
            try:
                s = payload.decode(charset, errors="replace")
            except Exception:
                s = payload.decode("utf-8", errors="replace")
            if ctype == "text/plain":
                text_parts.append(s)
            elif ctype == "text/html":
                html_parts.append(s)
    else:
        ctype = msg.get_content_type()
        payload = msg.get_payload(decode=True)
        if payload is None:
            payload = (msg.get_payload() or "").encode("utf-8", errors="replace")
        charset = msg.get_content_charset() or "utf-8"
        try:
            s = payload.decode(charset, errors="replace")
        except Exception:
            s = payload.decode("utf-8", errors="replace")
        if ctype == "text/plain":
            text_parts.append(s)
        elif ctype == "text/html":
            html_parts.append(s)

    text = "\n".join([t.strip() for t in text_parts if t and t.strip()]).strip()
    html = "\n".join([h.strip() for h in html_parts if h and h.strip()]).strip() or None

    if text:
        return text, html

    if html:
        # very basic html strip
        stripped = re.sub(r"(?is)<(script|style).*?>.*?</\\1>", "", html)
        stripped = re.sub(r"(?s)<[^>]+>", " ", stripped)
        stripped = re.sub(r"[ \\t\\f\\v]+", " ", stripped)
        stripped = re.sub(r"\\s*\\n\\s*", "\\n", stripped).strip()
        return stripped, html

    return "", None


def normalize_email(addr: str | None) -> str | None:
    if not addr:
        return None
    a = addr.strip().lower()
    if not a:
        return None
    return a


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mbox", required=True, help="Path to mbox file")
    parser.add_argument("--filter-email", required=False, help="Only include messages where this email appears")
    parser.add_argument("--limit", type=int, default=5000)
    args = parser.parse_args()

    filter_email = normalize_email(args.filter_email) if args.filter_email else None

    mbox = mailbox.mbox(args.mbox)

    out = []
    count = 0

    for msg in mbox:
        if count >= args.limit:
            break

        from_raw = msg.get("From")
        to_raw = msg.get("To")
        cc_raw = msg.get("Cc")

        from_addrs = getaddresses([from_raw] if from_raw else [])
        to_addrs = getaddresses([to_raw] if to_raw else [])
        cc_addrs = getaddresses([cc_raw] if cc_raw else [])

        from_email = normalize_email(from_addrs[0][1]) if from_addrs else None
        from_name = decode_header_value(from_addrs[0][0]) if from_addrs and from_addrs[0][0] else None
        to_emails = [normalize_email(a[1]) for a in to_addrs]
        cc_emails = [normalize_email(a[1]) for a in cc_addrs]

        to_emails = [e for e in to_emails if e]
        cc_emails = [e for e in cc_emails if e]

        if filter_email:
            in_participants = (
                (from_email == filter_email)
                or (filter_email in to_emails)
                or (filter_email in cc_emails)
            )
            if not in_participants:
                continue

        subject = decode_header_value(msg.get("Subject"))
        message_id = decode_header_value(msg.get("Message-ID"))
        in_reply_to = decode_header_value(msg.get("In-Reply-To"))
        references = decode_header_value(msg.get("References"))

        date_val = msg.get("Date")
        dt = None
        if date_val:
            try:
                dt = parsedate_to_datetime(date_val)
            except Exception:
                dt = None

        text, html = extract_text(msg)

        out.append(
            {
                "message_id": message_id,
                "in_reply_to": in_reply_to,
                "references": references,
                "subject": subject,
                "from_name": from_name,
                "from_email": from_email,
                "to_emails": to_emails,
                "cc_emails": cc_emails,
                "date": dt.isoformat() if dt else None,
                "body_text": text,
                "body_html": html,
            }
        )
        count += 1

    print(json.dumps({"count": len(out), "messages": out}))


if __name__ == "__main__":
    main()
