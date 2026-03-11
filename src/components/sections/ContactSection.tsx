'use client';

import { Theme, RewrittenContent, CoreContent } from '@/lib/types';
import { IconRenderer } from '../shapes/IconRenderer';

interface Props {
    theme: Theme;
    content: RewrittenContent;
    core: CoreContent;
}

export default function ContactSection({ theme, content, core }: Props) {
    const contactStyle = theme.layoutSchema.contactStyle;

    return (
        <section
            className={`contact contact--${contactStyle}`}
            id="contact"
            aria-label="Contact"
            data-track="contact-section"
        >
            <div className="section-inner">
                <div className="section-label">
                    <span className="section-label__line" />
                    <span className="section-label__text">Contact</span>
                </div>
                <h2 className="section-title">{content.contactTitle}</h2>
                <p className="contact__body">{content.contactBody}</p>

                <div className="contact__details flex gap-4 my-8">
                    <a
                        href={`mailto:${core.contact.email}`}
                        className="contact__email flex items-center gap-2"
                        data-track="contact-email"
                    >
                        <IconRenderer name="mail" themeSet={theme.iconSet} width={24} height={24} />
                        {core.contact.email}
                    </a>
                    <span className="contact__location flex items-center gap-2">
                        <IconRenderer name="globe" themeSet={theme.iconSet} width={24} height={24} />
                        {core.contact.location}
                    </span>
                </div>

                <div className="contact__social flex gap-4">
                    {core.socialLinks.map((link) => (
                        <a
                            key={link.platform}
                            href={link.url}
                            className="social-link flex items-center gap-2"
                            target="_blank"
                            rel="noopener noreferrer"
                            data-track={`social-${link.platform}`}
                        >
                            <IconRenderer name="link" themeSet={theme.iconSet} width={20} height={20} />
                            {link.platform}
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
