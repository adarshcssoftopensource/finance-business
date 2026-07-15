import React from 'react';
import { getLogoURL } from '../../utils/GlobalFunctions';
const prefix = `${process.env.REACT_APP_CDN_URL}/static/email-assets/`;
const webPrefix = `${process.env.REACT_APP_WEB_URL}`;

export const RecieptFooter = props => {
    return (
        <table width="640" align="center" border="0" cellpadding="0" cellspacing="0"
            className="fifth-child-table">
            <tbody>
                <tr>
                    <td className="td-26">
                        <table width="490" align="center" cellpadding="0" cellspacing="0" border="0"
                            className="common-table-style" className="fifth-child-table-inner-first-table">
                            <tbody>
                                <tr>
                                    <td align="center" className="td-27"><a href={webPrefix}
                                        target="_blank"><img width="175"
                                        src={getLogoURL()} alt="Finance" className="a-common-style" /></a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table width="490" align="center" cellpadding="0" cellspacing="0" border="0"
                            className="common-table-style">
                            <tbody>
                                <tr>
                                    <td align="center;"
                                        className="third-child-table-first-inner-table-td td-28">
                                        You received this message because you have an account with Finance
                or opted in to receive communications from Finance.</td>
                                </tr>
                            </tbody>
                        </table>
                        <table width="490" align="center" cellpadding="0" cellspacing="0" border="0"
                            className="common-table-style">
                            <tbody>
                                <tr>
                                    <td className="third-child-table-first-inner-table-td td-28 td-29">
                                        <a href={`${webPrefix}/privacy-policy`} target="_blank"
                                            className="a-common-again-style">Privacy
                    policy</a>
                &nbsp; • &nbsp;
                <a href={`${webPrefix}/terms-of-use`} target="_blank" className="a-common-again-style">Terms
                    of use</a>
                &nbsp; • &nbsp;
                <a href={`${webPrefix}/contact-us`} target="_blank" className="a-common-again-style">Contact
                    us</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table width="490" align="center" cellpadding="0" cellspacing="0" border="0"
                            style={{ 'borderCollapse': 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td align="center" className="td-common-again-style">
                                        555 West 5th Street, Floor 35, Los Angeles, CA 90013 USA</td>
                                </tr>
                            </tbody>
                        </table>
                        <table width="490" align="center" cellpadding="0" cellspacing="0" border="0"
                            className="common-table-style">
                            <tbody>
                                <tr>
                                    <td className="td-common-again-style td-30">
                                        &copy; {new Date().getFullYear()} <b>Finance</b>. All Rights Reserved.</td>
                                </tr>
                            </tbody>
                        </table>
                        <table align="center" cellpadding="0" cellspacing="0" border="0"
                            className="fifth-child-table-inner-fourth-table">
                            <tbody>
                                <tr>
                                    <td align="center" className="td-31">
                                        <a href="https://www.facebook.com/peymynt" target="_blank"
                                            className="td-31-a-tag"><img
                                                src={`${prefix}facebook-ic.png`}
                                                alt="Facebook" /></a>
                                        <a href="https://www.linkedin.com/company/peymynt/" target="_blank"
                                            className="td-31-a-tag"><img
                                                src={`${prefix}linkedin-ic.png`}
                                                alt="Linkedin" /></a>
                                        <a href="https://www.twitter.com/peymynt" target="_blank"
                                            className="td-31-a-tag"><img
                                                src={`${prefix}twitter-ic.png`}
                                                alt="Twitter" /></a>
                                        <a href="https://www.instagram.com/peymynt" target="_blank"
                                            className="td-31-a-tag"><img
                                                src={`${prefix}instagram-ic.png`}
                                                alt="Instagram" /></a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}