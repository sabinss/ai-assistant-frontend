"use client"
import { Dialog, DialogTrigger, DialogContent } from "@radix-ui/react-dialog"
import { Files, Globe, Map, Quote, Table } from "lucide-react"
import { useState } from "react"

function CardContents() {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)

  const handleFileUpload = (e) => {
    // Handle file upload logic here
  }

  const handleTableUpload = (e) => {
    // Handle table upload logic here
    console.log(e.target.files)
  }

  return (
    <div className="sources flex w-full flex-col gap-2">
      {/* Files Dialog */}
      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogTrigger asChild>
          <div className="file w-full cursor-pointer p-3 hover:bg-muted">
            <div className="filewrapper flex">
              <div className="mr-2">
                <Files />
              </div>
              <div className="title_description">
                <p>Files</p>
                <div className="text-sm text-muted-foreground">
                  Upload PDFs, Word and txt files contaning unstructured text
                  data.
                </div>
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent>
          <input type="file" multiple onChange={handleFileUpload} />
        </DialogContent>
      </Dialog>

      {/* Tables Dialog */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogTrigger asChild>
          <div className="Tables w-full p-3 hover:bg-muted">
            <div className="Tables wrapper flex">
              <div className="mr-2">
                <Table />
              </div>
              <div className="title_description">
                <p>Tables</p>
                <div className="text-sm text-muted-foreground">
                  Upload CSV, XLSX and xls files containing structured text
                  data.
                </div>
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent>
          <input type="file" multiple onChange={handleTableUpload} />
        </DialogContent>
      </Dialog>

      {/* Website URL */}
      <div className="Website URL w-full p-3 hover:bg-muted">
        <div className="Website URLwrapper flex">
          <div className="mr-2">
            <Globe />
          </div>
          <div className="title_description">
            <p>Website URL</p>
            <div className="text-sm text-muted-foreground">
              Add a URL (or a family of URLs) to be scraped and indexed for
              training.
            </div>
          </div>
        </div>
      </div>

      {/* Website Sitemap */}
      <div className="Website Sitemap w-full p-3 hover:bg-muted">
        <div className="Website Sitemapwrapper flex">
          <div className="mr-2">
            <Map />
          </div>
          <div className="title_description">
            <p>Website Sitemap</p>
            <div className="text-sm text-muted-foreground">
              Add a sitemap indicating web pages to be scraped and indexed for
              training.
            </div>
          </div>
        </div>
      </div>

      {/* Q&A */}
      <div className="Q&A w-full p-3 hover:bg-muted">
        <div className="Q&Awrapper flex">
          <div className="mr-2">
            <Quote />
          </div>
          <div className="title_description">
            <p>Q&A</p>
            <div className="text-sm text-muted-foreground">
              Enter specific question and answer pairs to directly inform the
              chatbot's responses.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardContents
