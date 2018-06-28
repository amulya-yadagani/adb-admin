import { AdbAdminTwoPage } from './app.po';

describe('adb-admin-two App', () => {
  let page: AdbAdminTwoPage;

  beforeEach(() => {
    page = new AdbAdminTwoPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
