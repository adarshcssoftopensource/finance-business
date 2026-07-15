{/* <div className="Collapsible_Content Margin__l-80">
                <div className="Banner Banner__statusWarning Banner__WithinPage my-4">
                  <div className="Banner__Ribbon">
                    <span className="Icon Icon__M">
                      <svg className="Icon__Svg">
                        <use xlinkHref="/assets/icons/product/symbols.svg#error_outline"></use>
                      </svg>
                    </span>
                  </div>
                  <div>
                    <div className="Banner__Header">
                      <p className="Banner__Heading">Connection failed.</p>
                    </div>
                    <div className="Banner__Content">
                      <p>Sorry, we couldn’t establish connection to this bank. Maybe the credentials has been changed. Try reconnecting to your bank account.</p>
                      <div className="Banner__Actions">
                      <Button color="primary Margin__r-8">Reconnect</Button>
                      <Button color="default">Learn more</Button>
                    </div>
                    </div>
                  </div>
                </div>
                <div className=" mt-4 py-box">
                  <h6>Connect accounts</h6>
                  <ul className="account-card__list list-unstyled w-100">
                    <li>

                      <div className="account-card__single">
                        <div className="account-card__single-header">
                        <div className="bg-primary Icon Icon__M me-3 text-white d-flex align-items-center justify-content-center border-radius">
                        <svg viewBox="0 0 40 40">
                            <path fill="currentColor" fill-rule="nonzero" d="M36.25 0A3.75 3.75 0 0140 3.75v30a3.75 3.75 0 01-3.75 3.75H35v1.25a1.25 1.25 0 01-2.5 0V37.5h-25v1.25a1.25 1.25 0 01-2.5 0V37.5H3.75A3.75 3.75 0 010 33.75v-30A3.75 3.75 0 013.75 0zm0 2.5H3.75c-.69 0-1.25.56-1.25 1.25v30c0 .69.56 1.25 1.25 1.25h32.5c.69 0 1.25-.56 1.25-1.25v-30c0-.69-.56-1.25-1.25-1.25zm-5 2.5A3.75 3.75 0 0135 8.75v20a3.75 3.75 0 01-3.75 3.75h-20a3.75 3.75 0 01-3.75-3.75V25H6.25a1.25 1.25 0 010-2.5H7.5V15H6.25a1.25 1.25 0 010-2.5H7.5V8.75A3.75 3.75 0 0111.25 5zm0 2.5h-20c-.69 0-1.25.56-1.25 1.25v3.75h1.25a1.25 1.25 0 010 2.5H10v7.5h1.25a1.25 1.25 0 010 2.5H10v3.75c0 .69.56 1.25 1.25 1.25h20c.69 0 1.25-.56 1.25-1.25v-20c0-.69-.56-1.25-1.25-1.25zM21.28 10c.69 0 1.25.56 1.25 1.25v1.89a5.51 5.51 0 011.39.51L25 12.56a1.25 1.25 0 011.74 1.77l-.93.93a5.78 5.78 0 011.05 2.24h1.89a1.25 1.25 0 010 2.5h-1.89a5.78 5.78 0 01-1.02 2.24l.93.93a1.25 1.25 0 01-.88 2.13 1.28 1.28 0 01-.89-.36l-1.11-1.09a5.65 5.65 0 01-1.39.51v1.89a1.25 1.25 0 01-2.5 0v-1.89a5.65 5.65 0 01-1.39-.51l-1.08 1.09a1.28 1.28 0 01-.89.36 1.25 1.25 0 01-.88-2.13l.93-.93A5.78 5.78 0 0115.64 20h-1.89a1.25 1.25 0 010-2.5h1.92a5.78 5.78 0 011.05-2.24l-.93-.93a1.252 1.252 0 111.77-1.77l1.08 1.09a5.65 5.65 0 011.39-.51v-1.89c0-.69.56-1.25 1.25-1.25zm-.03 5.5a3.25 3.25 0 000 6.5 3.26 3.26 0 003.25-3.25 3.25 3.25 0 00-3.25-3.25z"/>
                          </svg>
                        </div>
                          <div>
                            <div className="account-type">Total Checking
                            <span className="account-number">2123</span>
                            </div>
                            <div className="account-balance text-sm text-muted">
                              Balance
                              <span className="account-balance_value ms-2">
                                USD $342,343
                              </span>
                            </div>
                          </div>
                          <div className="account-card__single-acitons ms-auto">
                            <button className="btn bg-default hover:primary-100" onClick={this.toggle}>
                              Edit
                            </button>
                          </div>
                        </div>
                        <div className="account-card__single-footer">
                          <div className="Callout">
                          <span className="me-5">Do you want to import transactions from this account?</span>

                          <label className="py-switch ms-auto" for="AccountImportSwitch">
                            <input id="AccountImportSwitch" type="checkbox" className="py-toggle__checkbox" />
                              <span className="py-toggle__handle"></span>
                          </label>
                          </div>
                        </div>
                      </div>
                    </li>

                    <li>

                      <div className="account-card__single">
                        <div className="account-card__single-header">
                        <div className="bg-primary Icon Icon__M me-3 text-white d-flex align-items-center justify-content-center border-radius">
                        <svg viewBox="0 0 40 40">
                            <path fill="currentColor" fill-rule="nonzero" d="M36.25 0A3.75 3.75 0 0140 3.75v30a3.75 3.75 0 01-3.75 3.75H35v1.25a1.25 1.25 0 01-2.5 0V37.5h-25v1.25a1.25 1.25 0 01-2.5 0V37.5H3.75A3.75 3.75 0 010 33.75v-30A3.75 3.75 0 013.75 0zm0 2.5H3.75c-.69 0-1.25.56-1.25 1.25v30c0 .69.56 1.25 1.25 1.25h32.5c.69 0 1.25-.56 1.25-1.25v-30c0-.69-.56-1.25-1.25-1.25zm-5 2.5A3.75 3.75 0 0135 8.75v20a3.75 3.75 0 01-3.75 3.75h-20a3.75 3.75 0 01-3.75-3.75V25H6.25a1.25 1.25 0 010-2.5H7.5V15H6.25a1.25 1.25 0 010-2.5H7.5V8.75A3.75 3.75 0 0111.25 5zm0 2.5h-20c-.69 0-1.25.56-1.25 1.25v3.75h1.25a1.25 1.25 0 010 2.5H10v7.5h1.25a1.25 1.25 0 010 2.5H10v3.75c0 .69.56 1.25 1.25 1.25h20c.69 0 1.25-.56 1.25-1.25v-20c0-.69-.56-1.25-1.25-1.25zM21.28 10c.69 0 1.25.56 1.25 1.25v1.89a5.51 5.51 0 011.39.51L25 12.56a1.25 1.25 0 011.74 1.77l-.93.93a5.78 5.78 0 011.05 2.24h1.89a1.25 1.25 0 010 2.5h-1.89a5.78 5.78 0 01-1.02 2.24l.93.93a1.25 1.25 0 01-.88 2.13 1.28 1.28 0 01-.89-.36l-1.11-1.09a5.65 5.65 0 01-1.39.51v1.89a1.25 1.25 0 01-2.5 0v-1.89a5.65 5.65 0 01-1.39-.51l-1.08 1.09a1.28 1.28 0 01-.89.36 1.25 1.25 0 01-.88-2.13l.93-.93A5.78 5.78 0 0115.64 20h-1.89a1.25 1.25 0 010-2.5h1.92a5.78 5.78 0 011.05-2.24l-.93-.93a1.252 1.252 0 111.77-1.77l1.08 1.09a5.65 5.65 0 011.39-.51v-1.89c0-.69.56-1.25 1.25-1.25zm-.03 5.5a3.25 3.25 0 000 6.5 3.26 3.26 0 003.25-3.25 3.25 3.25 0 00-3.25-3.25z"/>
                          </svg>
                        </div>
                          <div>
                            <div className="account-type">Chase college
                            <span className="account-number">2123</span>
                            </div>
                            <div className="account-balance text-sm text-muted">
                              Balance
                              <span className="account-balance_value ms-2">
                                USD $342,343
                              </span>
                            </div>
                          </div>
                          <div className="account-card__single-acitons ms-auto">
                            <button className="btn bg-default hover:primary-100" onClick={this.toggle}>
                              Edit
                            </button>
                          </div>
                        </div>
                        <div className="account-card__single-footer">
                          <div className="Callout">
                          <span className="me-5">Do you want to import transactions from this account?</span>

                          <label className="py-switch ms-auto" for="AccountImportSwitch">
                            <input id="AccountImportSwitch" type="checkbox" className="py-toggle__checkbox" />
                              <span className="py-toggle__handle"></span>
                          </label>
                          </div>
                        </div>
                      </div>
                    </li>

                    <li>

                      <div className="account-card__single">
                        <div className="account-card__single-header">
                        <div className="bg-primary Icon Icon__M me-3 text-white d-flex align-items-center justify-content-center border-radius">
                        <svg viewBox="0 0 40 40">
                            <path fill="currentColor" fill-rule="nonzero" d="M36.25 0A3.75 3.75 0 0140 3.75v30a3.75 3.75 0 01-3.75 3.75H35v1.25a1.25 1.25 0 01-2.5 0V37.5h-25v1.25a1.25 1.25 0 01-2.5 0V37.5H3.75A3.75 3.75 0 010 33.75v-30A3.75 3.75 0 013.75 0zm0 2.5H3.75c-.69 0-1.25.56-1.25 1.25v30c0 .69.56 1.25 1.25 1.25h32.5c.69 0 1.25-.56 1.25-1.25v-30c0-.69-.56-1.25-1.25-1.25zm-5 2.5A3.75 3.75 0 0135 8.75v20a3.75 3.75 0 01-3.75 3.75h-20a3.75 3.75 0 01-3.75-3.75V25H6.25a1.25 1.25 0 010-2.5H7.5V15H6.25a1.25 1.25 0 010-2.5H7.5V8.75A3.75 3.75 0 0111.25 5zm0 2.5h-20c-.69 0-1.25.56-1.25 1.25v3.75h1.25a1.25 1.25 0 010 2.5H10v7.5h1.25a1.25 1.25 0 010 2.5H10v3.75c0 .69.56 1.25 1.25 1.25h20c.69 0 1.25-.56 1.25-1.25v-20c0-.69-.56-1.25-1.25-1.25zM21.28 10c.69 0 1.25.56 1.25 1.25v1.89a5.51 5.51 0 011.39.51L25 12.56a1.25 1.25 0 011.74 1.77l-.93.93a5.78 5.78 0 011.05 2.24h1.89a1.25 1.25 0 010 2.5h-1.89a5.78 5.78 0 01-1.02 2.24l.93.93a1.25 1.25 0 01-.88 2.13 1.28 1.28 0 01-.89-.36l-1.11-1.09a5.65 5.65 0 01-1.39.51v1.89a1.25 1.25 0 01-2.5 0v-1.89a5.65 5.65 0 01-1.39-.51l-1.08 1.09a1.28 1.28 0 01-.89.36 1.25 1.25 0 01-.88-2.13l.93-.93A5.78 5.78 0 0115.64 20h-1.89a1.25 1.25 0 010-2.5h1.92a5.78 5.78 0 011.05-2.24l-.93-.93a1.252 1.252 0 111.77-1.77l1.08 1.09a5.65 5.65 0 011.39-.51v-1.89c0-.69.56-1.25 1.25-1.25zm-.03 5.5a3.25 3.25 0 000 6.5 3.26 3.26 0 003.25-3.25 3.25 3.25 0 00-3.25-3.25z"/>
                          </svg>
                        </div>
                          <div>
                            <div className="account-type">Premier Checking
                            <span className="account-number">2123</span>
                            </div>
                            <div className="account-balance text-sm text-muted">
                              Balance
                              <span className="account-balance_value ms-2">
                                USD $342,343
                              </span>
                            </div>
                          </div>
                          <div className="account-card__single-acitons ms-auto">
                            <button className="btn bg-default hover:primary-100" onClick={this.toggle}>
                              Edit
                            </button>
                          </div>
                        </div>
                        <div className="account-card__single-footer">
                          <div className="Callout">
                          <span className="me-5">Do you want to import transactions from this account?</span>

                          <label className="py-switch ms-auto" for="AccountImportSwitch">
                            <input id="AccountImportSwitch" type="checkbox" className="py-toggle__checkbox" />
                              <span className="py-toggle__handle"></span>
                          </label>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div> */}