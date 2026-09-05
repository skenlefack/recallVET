import React, { Component } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';



class CkEditor extends Component {
    render() {
        return (            <>
               
                
                <div className="row">
                    <div className="col-xl-12 col-xxl-12">
                        <div className="card">
                            <div className="card-header">
                                <h4 className="card-title">Form CkEditor</h4>
                            </div>
                            <div className="card-body custom-ekeditor">
                                <CKEditor
                                    editor={ ClassicEditor }
                               
                                    onReady={ editor => {
                                        
                                    } }
                                    onChange={ ( event, editor ) => {
                                        
                                    } }
                                    onBlur={ ( event, editor ) => {
                                       
                                    } }
                                    onFocus={ ( event, editor ) => {
                                        
                                    } }
                                />
                            </div>
                        </div>
                    </div>        
                </div>        
               
            </>
        );
    }
}

export default CkEditor;